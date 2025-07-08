import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Button } from 'react-bootstrap';
import MyNavbarAdmin from "../components/MyNavbarAdmin";

export default function AdminScreen() {
  const [sections, setSections] = useState([]);
  const [newSectionName, setNewSectionName] = useState('');
  const [newCategorySection, setNewCategorySection] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryFile, setNewCategoryFile] = useState(null);
  const { userInfo } = useSelector(state => state.userLogin); // grab auth token

  useEffect(() => {
    async function load() {
      try {
        const { data } = await axios.get('/api/admin/sections/', {
          headers: { Authorization: `Bearer ${userInfo.token}` }
        });
        setSections(data);
      } catch (error) {
        console.error('Admin load error:', error);
      }
    }
    if (userInfo) load();
  }, [userInfo]);

  const addSection = async () => {
    try {
      await axios.post('/api/admin/sections/',
        { name: newSectionName, order: sections.length },
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      // reload sections
      const { data } = await axios.get('/api/admin/sections/', {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      setSections(data);
      setNewSectionName('');
    } catch (error) {
      console.error('Add section error:', error);
    }
  };

  const addCategory = async () => {
    try {
      const formData = new FormData();
      formData.append('section', newCategorySection);
      formData.append('name', newCategoryName);
      formData.append('excel_file', newCategoryFile);
      formData.append('order', sections.find(sec => sec.id === parseInt(newCategorySection)).categories.length);

      await axios.post('/api/admin/categories/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${userInfo.token}`
        }
      });
      // reload sections to include new category
      const { data } = await axios.get('/api/admin/sections/', {
        headers: { Authorization: `Bearer ${userInfo.token}` }
      });
      setSections(data);
      // reset category form
      setNewCategorySection('');
      setNewCategoryName('');
      setNewCategoryFile(null);
    } catch (error) {
      console.error('Add category error:', error);
    }
  };

  return (
    <>
      <header>
        <MyNavbarAdmin />
      </header>
    <div>
      <h2>Manage Sections</h2>
        {/* List existing sections */}
        <ul>
          {sections.map(section => (
            <li key={section.id} className="d-flex align-items-center mb-1">
              <span>{section.name}</span>
            </li>
          ))}
        </ul>

        {/* Add new section */}
        <div className="d-flex mb-4">
          <input
            type="text"
            className="form-control me-2"
            placeholder="New section name"
            value={newSectionName}
            onChange={e => setNewSectionName(e.target.value)}
          />
          <Button variant="primary" onClick={addSection} disabled={!newSectionName}>
            Add Section
          </Button>
        </div>

        <h2>Manage Categories</h2>
        {/* List existing categories grouped by section */}
        {sections.map(section => (
          <div key={section.id} className="mb-3">
            <h5>{section.name}</h5>
            <ul>
              {section.categories.map(cat => (
                <li key={cat.id}>{cat.name}</li>
              ))}
            </ul>
          </div>
        ))}

        {/* Add new category */}
        <div className="mb-3">
          <h5>Add Category</h5>
          <div className="d-flex align-items-center mb-2">
            <select
              className="form-select me-2"
              value={newCategorySection}
              onChange={e => setNewCategorySection(e.target.value)}
            >
              <option value="">Select section</option>
              {sections.map(sec => (
                <option key={sec.id} value={sec.id}>{sec.name}</option>
              ))}
            </select>
            <input
              type="text"
              className="form-control me-2"
              placeholder="Category name"
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
            />
            <input
              type="file"
              className="form-control me-2"
              onChange={e => setNewCategoryFile(e.target.files[0])}
            />
            <Button
              variant="primary"
              onClick={addCategory}
              disabled={!newCategorySection || !newCategoryName || !newCategoryFile}
            >
              Upload
            </Button>
          </div>
        </div>
      </div>
      </>
  );
}