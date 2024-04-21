const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const faceapi = require("face-api.js");
const { Canvas, Image } = require("canvas");
const canvas = require("canvas");
const fileUpload = require("express-fileupload");
faceapi.env.monkeyPatch({ Canvas, Image });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({limit: '50mb',extended : true}));
app.use(
  cors({
    origin: 'http://localhost:5173', // Allow requests from this origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow these HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
  })
);

app.use(fileUpload({ useTempFiles: true }));

// Connect to MongoDB (make sure MongoDB is running)
mongoose.connect('mongodb://localhost:27017/AT', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Load face detection models
async function loadModels() {
  await faceapi.nets.faceRecognitionNet.loadFromDisk(__dirname + "/models");
  await faceapi.nets.faceLandmark68Net.loadFromDisk(__dirname + "/models");
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(__dirname + "/models");
}
loadModels();

// Define MongoDB schema and model
const faceSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    unique: true,
  },
  descriptions: {
    type: Array,
    required: true,
  },
});

const FaceModel = mongoose.model("Face", faceSchema);

// Upload labeled images
async function uploadLabeledImages(images, label) {
  try {
    const descriptions = [];
    for (let i = 0; i < images.length; i++) {
      const img = await canvas.loadImage(images[i]);
      const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
      descriptions.push(detections.descriptor);
    }

    const createFace = new FaceModel({
      label: label,
      descriptions: descriptions,
    });
    await createFace.save();
    return true;
  } catch (error) {
    console.log(error);
    return error;
  }
}

// Handle POST request to upload faces
app.post("/post-face", async (req, res) => {
  const File1 = req.files.File1.tempFilePath;
  const File2 = req.files.File2.tempFilePath;
  const File3 = req.files.File3.tempFilePath;
  const label = req.body.label;
  
  let result = await uploadLabeledImages([File1, File2, File3], label);
  
  if (result) {
    res.json({ message: "Face data stored successfully" });
  } else {
    res.json({ message: "Something went wrong, please try again." });
  }
});

// Retrieve face descriptors from database
async function getDescriptorsFromDB(image) {
  let faces = await FaceModel.find();
  
  for (i = 0; i < faces.length; i++) {
    for (j = 0; j < faces[i].descriptions.length; j++) {
      faces[i].descriptions[j] = new Float32Array(Object.values(faces[i].descriptions[j]));
    }
    faces[i] = new faceapi.LabeledFaceDescriptors(faces[i].label, faces[i].descriptions);
  }

  const faceMatcher = new faceapi.FaceMatcher(faces, 0.6);
  const img = await canvas.loadImage(image);
  let temp = faceapi.createCanvasFromMedia(img);
  const displaySize = { width: img.width, height: img.height };
  faceapi.matchDimensions(temp, displaySize);

  const detections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();
  const resizedDetections = faceapi.resizeResults(detections, displaySize);
  const results = resizedDetections.map((d) => faceMatcher.findBestMatch(d.descriptor));
  return results;
}

// Handle POST request to check faces
app.post("/check-face", async (req, res) => {
  const File1 = req.files.File1.tempFilePath;
  let result = await getDescriptorsFromDB(File1);
  res.json({ result });

});


// Define User Schema
const User = mongoose.model('User', {
  name: String,
  email: String,
  password: String,
  dept: String,
});

// Define Student Schema
const studentSchema = new mongoose.Schema({
  name: String,
  rollNo: String,
  email: String,
});

const Student = mongoose.model('Student', studentSchema);

// Define Class Schema
const classSchema = new mongoose.Schema({
  courseName: String,
  courseCode: String,
  sessionTiming: String,
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
});

const Class = mongoose.model('Class', classSchema);

// Signup Route
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, dept } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({ name, email, password: hashedPassword, dept });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Signup failed:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// Login Route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create and return a JWT token
    const token = jwt.sign({ userId: user._id }, 'secretKey', { expiresIn: '1h' });

    res.status(200).json({ token, userId: user._id });
  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token.split(' ')[1], 'secretKey');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('Invalid token:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Route to get user data
app.get('/api/user', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ name: user.name, email: user.email, dept: user.dept });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Error fetching user data' });
  }
});

// Route to add a new student
app.post('/api/students', async (req, res) => {
  const { name, rollNo, email } = req.body;

  try {
    const newStudent = new Student({ name, rollNo, email });
    await newStudent.save();

    res.status(201).json({ message: 'Student added successfully' });
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).json({ error: 'Failed to add student' });
  }
});

// Route to create a new class
app.post('/api/classes', async (req, res) => {
  const { courseName, courseCode, sessionTiming } = req.body;

  try {
    const newClass = new Class({ courseName, courseCode, sessionTiming });
    await newClass.save();

    res.status(201).json({ message: 'Class created successfully' });
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).json({ error: 'Failed to create class' });
  }
});

// Route to fetch all classes
app.get('/api/classes', async (req, res) => {
  try {
    const classes = await Class.find({})
      .populate('enrolledStudents', 'name rollNo email') // Populate enrolled students
      .select('courseName courseCode sessionTiming enrolledStudents'); // Select specific fields
    res.status(200).json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});


// Route to fetch all students
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find({}, 'name');
    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

const enrollmentSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  studentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]
});

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

app.post('/api/enroll', verifyToken, async (req, res) => {
  const { courseId, studentIds } = req.body;

  try {
    const selectedClass = await Class.findById(courseId);
    if (!selectedClass) {
      return res.status(404).json({ error: 'Class not found' });
    }
    selectedClass.enrolledStudents.push(...studentIds);
    await selectedClass.save();

    res.status(200).json({ message: 'Students enrolled successfully', enrolledStudentIds: studentIds });
  } catch (error) {
    console.error('Enrollment failed:', error);
    res.status(500).json({ error: 'Failed to enroll students' });
  }
});

app.get('/api/classes/:courseId/students', async (req, res) => {
  try {
    const { courseId } = req.params;
    const selectedClass = await Class.findById(courseId).populate('enrolledStudents', 'name rollNo');
    
    if (!selectedClass) {
      return res.status(404).json({ error: 'Class not found' });
    }

    res.status(200).json(selectedClass.enrolledStudents);
  } catch (error) {
    console.error('Error fetching enrolled students:', error);
    res.status(500).json({ error: 'Failed to fetch enrolled students' });
  }
});

// Route to delete a course by ID
app.delete('/api/classes/:id', async (req, res) => {
  const courseId = req.params.id;

  try {
    const course = await Class.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    await Class.deleteOne({ _id: courseId }); // Delete the course from the database
    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

// Define a route to handle unenrolling a student from a class
app.post('/api/classes/:courseId/unenroll', verifyToken, async (req, res) => {
  const { courseId } = req.params;
  const { studentId } = req.body;

  try {
    const selectedClass = await Class.findById(courseId);

    if (!selectedClass) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Remove the student from the enrolledStudents array
    const updatedEnrolledStudents = selectedClass.enrolledStudents.filter(
      (enrolledStudentId) => String(enrolledStudentId) !== studentId
    );

    selectedClass.enrolledStudents = updatedEnrolledStudents;
    await selectedClass.save();

    res.status(200).json({ message: 'Student unenrolled successfully' });
  } catch (error) {
    console.error('Error unenrolling student:', error);
    res.status(500).json({ error: 'Failed to unenroll student' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
