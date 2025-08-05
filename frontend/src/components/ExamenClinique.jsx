// ExamenClinique.jsx
/*
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { saveMedicalFile, resetMedicalFileSave } from '../actions/medicalFileActions';
import { Button } from 'react-bootstrap';
import Loader from '../components/Loader';
import Message from '../components/Message';

export default function ExamenClinique({ patientId }) {
  const dispatch = useDispatch();
  const { userInfo } = useSelector(state => state.userLogin);
  const medSave = useSelector(state => state.medicalFileSave);

  const [sections, setSections] = useState([]);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    async function load() {
      const { data } = await axios.get(
        '/api/admin/sections/?name=examen clinique',
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      setSections(data);
    }
    if (userInfo) load();
  }, [userInfo]);

  const handleChange = (fieldId, value) => {
    setAnswers(prev => ({ ...prev, [fieldId]: value }));
  };

  const toggleOption = (fieldId, optId) => {
    const arr = answers[fieldId] || [];
    const next = arr.includes(optId)
      ? arr.filter(x => x !== optId)
      : [...arr, optId];
    handleChange(fieldId, next);
  };

  const handleSubmit = () => {
    dispatch(
      saveMedicalFile(patientId, {
        category: 'examen_clinique',
        entries: Object.entries(answers).map(([fid, val]) => ({ fid, value: val })),
      })
    );
  };

  if (!sections.length) return <Loader />;

  return (
    <div className="p-3">
      {sections[0].categories.map(cat => (
        <section key={cat.id} className="mb-4">
          <h4>{cat.name}</h4>

          {/* numeric/text fields }
          {cat.fields.map(f => (
            <div key={f.id} className="mb-3">
              <label className="form-label">{f.name}</label>
              <input
                type={f.field_type}
                className="form-control"
                value={answers[f.id] || ''}
                onChange={e => handleChange(f.id, e.target.value)}
              />
            </div>
          ))}

          {/* subcategories }
          {cat.subcategories.map(sub => (
            <div key={sub.id} className="mb-3">
              <h5>{sub.name}</h5>
              {sub.fields.map(fld => (
                <div key={fld.id}>
                  {fld.options.map(opt => (
                    <div className="form-check" key={opt.id}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`opt-${opt.id}`}
                        checked={(answers[fld.id] || []).includes(opt.id)}
                        onChange={() => toggleOption(fld.id, opt.id)}
                      />
                      <label className="form-check-label" htmlFor={`opt-${opt.id}`}>
                        {opt.label}
                      </label>
                      {opt.is_other && (answers[fld.id] || []).includes(opt.id) && (
                        <input
                          type="text"
                          className="form-control mt-1"
                          placeholder="Précisez…"
                          value={answers[`other-${fld.id}`] || ''}
                          onChange={e => handleChange(`other-${fld.id}`, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}

          <Button
            variant="success"
            onClick={handleSubmit}
            disabled={medSave.loading}
          >
            {medSave.loading ? 'Saving…' : 'Save Examen Clinique'}
          </Button>

          {medSave.error && <Message variant="danger" className="mt-2">{medSave.error}</Message>}
          {medSave.success && <Message variant="success" className="mt-2">Saved!</Message>}
        </section>
      ))}
    </div>
  );
}
*/
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { saveMedicalFile, resetMedicalFileSave } from '../actions/medicalFileActions';
import Loader from '../components/Loader';
import Message from '../components/Message';

export default function ExamenClinique({ patientId, sectionId }) {
  const dispatch = useDispatch();
  const { userInfo } = useSelector(state => state.userLogin);
  const medSave = useSelector(state => state.medicalFileSave);

  const [section, setSection] = useState(null);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    async function load() {
      const { data } = await axios.get(
        // '/api/admin/sections/?name=examen clinique',
        // point explicitly to backend URL
        // `http://127.0.0.1:8000/api/admin/sections/?name=${encodeURIComponent('examen clinique')}`,
        `/api/admin/sections/${sectionId}/`,
        { headers: { Authorization: `Bearer ${userInfo.token}` } }
      );
      setSection(data);
    }
    if (userInfo) load();
  }, [userInfo]);

  const handleChange = (fieldId, value) => {
    setAnswers(prev => ({ ...prev, [fieldId]: value }));
  };

  const toggleOption = (fieldId, optId) => {
    const arr = answers[fieldId] || [];
    const next = arr.includes(optId)
      ? arr.filter(x => x !== optId)
      : [...arr, optId];
    handleChange(fieldId, next);
  };

  /*const handleSubmit = () => {
    dispatch(
      saveMedicalFile(patientId, {
        category: 'examen_clinique',
        entries: Object.entries(answers).map(([fid, value]) => ({ fid, value })),
      })
    );
  };*/

  const handleSubmit = () => {
   // Flatten all categories & subcategories into { label, code } items
   const entries = section.categories.flatMap(cat => {
     // direct numeric/text fields
     const direct = cat.fields.map(f => ({
       label: f.name,
       code: answers[f.id] != null ? String(answers[f.id]) : ''
     }));

     // each subcategory: multi-choice
     const subs = cat.subcategories.flatMap(sub =>
       sub.fields.flatMap(fld => {
         const picked = answers[fld.id] || [];
         return picked.map(optId => {
           const opt = fld.options.find(o => o.id === optId);
           const isOther = opt?.is_other;
           return {
             label: `${fld.name}: ${opt?.label}`,
             code: isOther
               ? (answers[`other-${fld.id}`] || '')
               : ''
           };
         });
       })
     );

     return [...direct, ...subs];
   });

   dispatch(
     saveMedicalFile(patientId, {
       category: 'examen clinique',
       entries
     })
   );
 };

  if (!section) return <Loader />;

  return (
    <div className="p-3">
      {section.categories.map(cat => (
        <section key={cat.id} className="mb-4">
          <h4>{cat.name}</h4>

          {/* Direct fields */}
          {cat.fields.map(f => (
            <div key={f.id} className="mb-3">
              <label className="form-label">{f.name}</label>
              <input
                type={f.field_type}
                className="form-control"
                value={answers[f.id] || ''}
                onChange={e => handleChange(f.id, e.target.value)}
              />
            </div>
          ))}

          {/* Subcategories */}
          {cat.subcategories.map(sub => (
            <div key={sub.id} className="mb-3">
              <h5>{sub.name}</h5>
              {sub.fields.map(fld => (
                <div key={fld.id}>
                  {fld.options.map(opt => (
                    <div className="form-check" key={opt.id}>
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`opt-${opt.id}`}
                        checked={(answers[fld.id] || []).includes(opt.id)}
                        onChange={() => toggleOption(fld.id, opt.id)}
                      />
                      <label className="form-check-label" htmlFor={`opt-${opt.id}`}>
                        {opt.label}
                      </label>
                      {opt.is_other && (answers[fld.id] || []).includes(opt.id) && (
                        <input
                          type="text"
                          className="form-control mt-1"
                          placeholder="Précisez…"
                          value={answers[`other-${fld.id}`] || ''}
                          onChange={e => handleChange(`other-${fld.id}`, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}

          <button
            className="btn btn-success"
            onClick={handleSubmit}
            disabled={medSave.loading}
          >
            {medSave.loading ? 'Saving…' : 'Save Examen Clinique'}
          </button>

          {medSave.error && <Message variant="danger" className="mt-2">{medSave.error}</Message>}
          {medSave.success && <Message variant="success" className="mt-2">Saved!</Message>}
        </section>
      ))}
    </div>
  );
}
