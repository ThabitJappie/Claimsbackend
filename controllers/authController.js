// authController.js

const { executeQuery } = require('../config/db');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Received login request:', email, password);  // Log the received login request

        // Query to check if the user exists with the provided email and password
        const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
        const results = await executeQuery(query, [email, password]);
        
        console.log('Query results:', results);  // Log the query results

        if (results.length > 0) {
            const user = results[0];
            const role = user.role.toLowerCase();  // Ensure role is in lowercase format
            console.log('Login successful. User role:', role);  // Log the user's role for verification
            
            res.status(200).json({
                message: 'Login successful',
                role: role,         // Send the role exactly as expected by the frontend
                code: user.code || null,  // Include the code if applicable for specific roles, or set to null
            });
        } else {
            console.log('Invalid credentials provided');  // Log invalid credentials attempt
            res.status(401).json({ message: 'Invalid credentials' });
        }

    } catch (error) {
        console.error('Database error:', error);  // Log any database errors
        res.status(500).json({ message: 'Internal server error' });
    }
};