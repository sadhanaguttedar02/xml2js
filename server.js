const express = require('express');
const cors = require('cors');
const fs = require('fs');
const xml2js = require('xml2js');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Load data from XML file
async function loadDataFromXml() {
  const data = fs.readFileSync('public/data.xml', 'utf-8');
  const result = await xml2js.parseStringPromise(data);
  return result.root.row.map((row, index) => ({
    id: index + 1,
    name: row.name[0],
    lastname: row.lastname[0],
    email: row.email[0],
    salary: row.salary[0],
    phone: row.phone[0]
  }));
}

// Get all data
app.get('/api/data', async (req, res) => {
  try {
    const data = await loadDataFromXml();
    res.json(data);
  } catch (error) {
    res.status(500).send('Error loading data from XML');
  }
});

// Update data
app.put('/api/data/:id', async (req, res) => {
  const { id } = req.params;
  const { name, lastname, email, salary, phone } = req.body;

  try {
    const data = await loadDataFromXml();
    const updatedData = data.map(row => {
      if (row.id === parseInt(id)) {
        row.name = name;
        row.lastname = lastname;
        row.email = email;
        row.salary = salary;
        row.phone = phone;
      }
      return row;
    });

    // Save updated data back to XML file
    const builder = new xml2js.Builder();
    const xml = builder.buildObject({ root: { row: updatedData } });
    fs.writeFileSync('public/data.xml', xml, 'utf-8');

    res.status(200).json({ message: 'Data updated successfully' });
  } catch (error) {
    res.status(500).send('Error updating data');
  }
});

// Delete data
app.delete('/api/data/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const data = await loadDataFromXml();
    const filteredData = data.filter(row => row.id !== parseInt(id));

    // Save filtered data back to XML file
    const builder = new xml2js.Builder();
    const xml = builder.buildObject({ root: { row: filteredData } });
    fs.writeFileSync('public/data.xml', xml, 'utf-8');

    res.status(200).json({ message: 'Data deleted successfully' });
  } catch (error) {
    res.status(500).send('Error deleting data');
  }
});

// Add new data
app.post('/api/data', async (req, res) => {
  const { name, lastname, email, salary, phone } = req.body;

  try {
    const data = await loadDataFromXml();

    // Check for duplicate email
    const emailExists = data.some((row) => row.email === email);
    if (emailExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const newRow = {
      id: data.length + 1, // Auto-increment ID
      name,
      lastname,
      email,
      salary,
      phone,
    };
    data.push(newRow);

    // Save updated data back to XML file
    const builder = new xml2js.Builder();
    const xml = builder.buildObject({ root: { row: data } });
    fs.writeFileSync('public/data.xml', xml, 'utf-8');

    res.status(201).json({ message: 'Data added successfully' });
  } catch (error) {
    res.status(500).send('Error adding data');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
