const Employee = require('../models/Employee');
const sendEmail = require('../utils/sendEmail');
const User = require('../models/User');
// @desc    Get all employees
// @route   GET /api/employees
// @access  Private (Admin only)
exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getOneEmployee= async (req,res)=>{
  try
  {
    const employee= await Employee.findById(req.params.id);
    res.json(employee);
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private (Admin only)


exports.createEmployee = async (req, res) => {
  const { fullName, username, domain, salary, position, employeeId,password,email } = req.body;

  try {
    // Check for existing employee (improved error handling)
    const existingEmployee = await Employee.findOne({ 
      $or: [{ employeeId }, { username }] 
    });

    if (existingEmployee) {
      return res.status(400).json({ 
        success: false,
        message: existingEmployee.employeeId === employeeId 
          ? 'Employee ID already in use' 
          : 'Username already taken'
      });
    }

    // Create and save employee
    const employee = new Employee({
      fullName,
      username,
      domain,
      salary,
      position,
      employeeId,
      password,
      email
    });

    await employee.save();

    await sendEmail({
      to: employee.email,
      subject: 'Welcome to CityFix! Your Employee Account Credentials',
      html: `
        <h1>Welcome ${fullName}!</h1>
        <p>Your employee account has been created.</p>
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Password:</strong> ${password}</p>
        <p>Please keep this information secure.</p>
      `
    
    });

    res.status(201).json({
      success: true,
      data: employee
    });

  } catch (err) {
    console.error('Error creating employee:', err); // Log full error
    res.status(500).json({ 
      success: false,
      message: err.message || 'Server error' // Send actual error
    });
  }
};

exports.updateEmployee = async (req, res) => {
  const { fullName, domain, salary, position,email} = req.body;

  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { fullName, domain, salary, position,email},
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private (Admin only)

exports.deleteEmployee = async (req, res) => {
  try {
    // First find the employee to get their username
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ 
        success: false,
        message: 'Employee not found' 
      });
    }

    // Delete the employee's user credentials
    await User.findOneAndDelete({ username: employee.username });

    // Then delete the employee
    await Employee.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Employee and their login credentials deleted successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
};