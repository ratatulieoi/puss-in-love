import { useState, useEffect } from 'react';
import '../styles/Cats.css';

const API = 'http://localhost:3100/api';
const SERVER = 'http://localhost:3100';
const SELECTED_CAT_KEY = 'pussInLoveSelectedCatId';

function Cats({ token }) {
    const [cats, setCats] = useState([]);
    const [breeds, setBreeds] = useState([]);
    const [photos, setPhotos] = useState({});
    const [vaccinations, setVaccinations] = useState({});
    const [selectedCatId, setSelectedCatId] = useState(() => {
        const savedCatId = localStorage.getItem(SELECTED_CAT_KEY);
        return savedCatId ? Number(savedCatId) : null;
    });
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ name: '', breed_id: '', gender: 'unknown', birth_date: '', color: '', description: '' });
    const [vaccineForm, setVaccineForm] = useState({ vaccine_name: '', date_given: '', certificate: null });
    const [pendingPhoto, setPendingPhoto] = useState(null);
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');
    const [catListOpen, setCatListOpen] = useState(false);
    const [activePhotoId, setActivePhotoId] = useState(null);

    useEffect(() => { if (msg) { const t = setTimeout(() => setMsg(''), 3000); return () => clearTimeout(t); } }, [msg]);
    useEffect(() => { if (error) { const t = setTimeout(() => setError(''), 4000); return () => clearTimeout(t); } }, [error]);
    useEffect(() => {
        if (selectedCatId) {
            localStorage.setItem(SELECTED_CAT_KEY, selectedCatId);
        } else {
            localStorage.removeItem(SELECTED_CAT_KEY);
        }
        setActivePhotoId(null);
    }, [selectedCatId]);

    const jsonHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
    const authHeaders = { Authorization: `Bearer ${token}` };

    const fetchCats = async () => {
        const res = await fetch(`${API}/cats`, { headers: jsonHeaders });
        const data = await res.json();
        const nextCats = data.data || [];
        setCats(nextCats);
        setSelectedCatId(prev => {
            if (prev && nextCats.some(cat => cat.id === prev)) return prev;
            return nextCats[0]?.id || null;
        });
    };

    const fetchBreeds = async () => {
        const res = await fetch(`${API}/breeds`, { headers: jsonHeaders });
        const data = await res.json();
        setBreeds(data.data || []);
    };

    const fetchPhotos = async (catId) => {
        const res = await fetch(`${API}/cats/${catId}/photos`, { headers: jsonHeaders });
        const data = await res.json();
        setPhotos(prev => ({ ...prev, [catId]: data.data || [] }));
    };

    const fetchVaccinations = async (catId) => {
        const res = await fetch(`${API}/cats/${catId}/vaccinations`, { headers: jsonHeaders });
        const data = await res.json();
        setVaccinations(prev => ({ ...prev, [catId]: data.data || [] }));
    };

    useEffect(() => { fetchCats(); fetchBreeds(); }, []);

    useEffect(() => {
        cats.forEach(cat => {
            fetchPhotos(cat.id);
            fetchVaccinations(cat.id);
        });
    }, [cats.length]);

    const resetForm = () => {
        setForm({ name: '', breed_id: '', gender: 'unknown', birth_date: '', color: '', description: '' });
        setShowForm(false);
        setEditingId(null);
        setPendingPhoto(null);
        setVaccineForm({ vaccine_name: '', date_given: '', certificate: null });
        setError('');
    };

    const startAdd = () => {
        resetForm();
        setVaccineForm({ vaccine_name: '', date_given: '', certificate: null });
        setShowForm(true);
        setCatListOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMsg(''); setError('');

        const payload = { ...form, breed_id: form.breed_id ? Number(form.breed_id) : null };
        const url = editingId ? `${API}/cats/${editingId}` : `${API}/cats`;
        const method = editingId ? 'PUT' : 'POST';

        const res = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(payload) });
        const data = await res.json();
        if (!res.ok) return setError(data.error);

        const savedCatId = editingId || data.data?.id;

        if (!editingId && savedCatId && pendingPhoto) {
            const photoData = new FormData();
            photoData.append('photo', pendingPhoto);
            const photoRes = await fetch(`${API}/cats/${savedCatId}/photos`, { method: 'POST', headers: authHeaders, body: photoData });
            const photoResult = await photoRes.json();
            if (!photoRes.ok) return setError(photoResult.error);
        }

        if (!editingId && savedCatId && vaccineForm.vaccine_name) {
            const vaccineData = new FormData();
            vaccineData.append('vaccine_name', vaccineForm.vaccine_name);
            vaccineData.append('date_given', vaccineForm.date_given);
            if (vaccineForm.certificate) vaccineData.append('certificate', vaccineForm.certificate);
            const vaccineRes = await fetch(`${API}/cats/${savedCatId}/vaccinations`, { method: 'POST', headers: authHeaders, body: vaccineData });
            const vaccineResult = await vaccineRes.json();
            if (!vaccineRes.ok) return setError(vaccineResult.error);
        }

        setMsg(editingId ? 'Cat profile updated.' : 'Cat profile created.');
        resetForm();
        fetchCats();
    };

    const handleEdit = (cat) => {
        setForm({
            name: cat.name,
            breed_id: cat.breed_id || '',
            gender: cat.gender,
            birth_date: cat.birth_date ? cat.birth_date.split('T')[0] : '',
            color: cat.color || '',
            description: cat.description || ''
        });
        setSelectedCatId(cat.id);
        setEditingId(cat.id);
        setPendingPhoto(null);
        setVaccineForm({ vaccine_name: '', date_given: '', certificate: null });
        setShowForm(true);
        setMsg('');
        setCatListOpen(false);
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this cat? Related photos, vaccinations, swipes, matches, and messages will also be deleted.')) return;
        const res = await fetch(`${API}/cats/${id}`, { method: 'DELETE', headers: jsonHeaders });
        const data = await res.json();
        if (!res.ok) return setError(data.error);
        setMsg('Cat profile deleted.');
        resetForm();
        fetchCats();
    };

    const handlePhotoUpload = async (catId, file) => {
        if (!file) return;
        setMsg(''); setError('');
        const data = new FormData();
        data.append('photo', file);
        const res = await fetch(`${API}/cats/${catId}/photos`, { method: 'POST', headers: authHeaders, body: data });
        const result = await res.json();
        if (!res.ok) return setError(result.error);
        setMsg('Photo uploaded.');
        fetchPhotos(catId);
    };

    const handleDeletePhoto = async (catId, photoId) => {
        const res = await fetch(`${API}/photos/${photoId}`, { method: 'DELETE', headers: jsonHeaders });
        const data = await res.json();
        if (!res.ok) return setError(data.error);
        setMsg('Photo deleted.');
        fetchPhotos(catId);
    };

    const handleSetPrimary = async (catId, photoId) => {
        const res = await fetch(`${API}/photos/${photoId}/primary`, { method: 'PUT', headers: jsonHeaders });
        const data = await res.json();
        if (!res.ok) return setError(data.error);
        setMsg('Main profile photo updated.');
        fetchPhotos(catId);
    };

    const handleAddVaccination = async (e, catId) => {
        e.preventDefault();
        setMsg(''); setError('');
        const data = new FormData();
        data.append('vaccine_name', vaccineForm.vaccine_name);
        data.append('date_given', vaccineForm.date_given);
        if (vaccineForm.certificate) data.append('certificate', vaccineForm.certificate);
        const res = await fetch(`${API}/cats/${catId}/vaccinations`, { method: 'POST', headers: authHeaders, body: data });
        const result = await res.json();
        if (!res.ok) return setError(result.error);
        setVaccineForm({ vaccine_name: '', date_given: '', certificate: null });
        setMsg('Vaccination record added.');
        fetchVaccinations(catId);
    };

    const handleDeleteVaccination = async (catId, vaccinationId) => {
        const res = await fetch(`${API}/vaccinations/${vaccinationId}`, { method: 'DELETE', headers: jsonHeaders });
        const data = await res.json();
        if (!res.ok) return setError(data.error);
        setMsg('Vaccination record deleted.');
        fetchVaccinations(catId);
    };

    const selectedCat = cats.find(cat => cat.id === selectedCatId) || cats[0];
    const selectedPhotos = selectedCat ? photos[selectedCat.id] || [] : [];
    const selectedVaccinations = selectedCat ? vaccinations[selectedCat.id] || [] : [];
    const activePhoto = selectedPhotos.find(photo => photo.id === activePhotoId) || selectedPhotos.find(photo => photo.is_primary) || selectedPhotos[0];
    const isAddingProfile = showForm && !editingId;
    const isEditingProfile = showForm && (isAddingProfile || (selectedCat && editingId === selectedCat.id));
    const otherCats = selectedCat ? cats.filter(c => c.id !== selectedCat.id) : cats;

    /* ── Render helpers ── */
    const renderGallery = () => {
        if (isAddingProfile) {
            return (
                <div className="cats-upload-zone">
                    {pendingPhoto ? (
                        <img className="cats-pending-preview" src={URL.createObjectURL(pendingPhoto)} alt="Preview" />
                    ) : (
                        <label>
                            <span>📷</span>
                            <p>Choose first photo</p>
                            <input type="file" accept="image/jpeg,image/png" onChange={e => setPendingPhoto(e.target.files[0])} />
                        </label>
                    )}
                </div>
            );
        }
        if (!selectedCat) return null;
        return (
            <>
                {activePhoto ? (
                    <img src={`${SERVER}${activePhoto.photo_url}`} alt={selectedCat.name} />
                ) : (
                    <div className="cats-gallery-empty">
                        <span>{selectedCat.name.charAt(0)}</span>
                        <p>No photo yet</p>
                    </div>
                )}
                {!isEditingProfile && (
                    <div className="cats-gallery-overlay">
                        <h1>{selectedCat.name}</h1>
                        <p>{selectedCat.breed_name || 'Unknown breed'} · {selectedCat.gender}</p>
                    </div>
                )}
                {selectedPhotos.length > 1 && (
                    <div className="cats-gallery-thumbs">
                        {selectedPhotos.map(p => (
                            <button key={p.id} type="button" className={`cats-gthumb ${p.id === (activePhoto?.id) ? 'active' : ''}`} onClick={() => setActivePhotoId(p.id)}>
                                <img src={`${SERVER}${p.photo_url}`} alt="" />
                            </button>
                        ))}
                    </div>
                )}
            </>
        );
    };

    const renderViewPanel = () => (
        <>
            <h2 className="cats-view-name">{selectedCat.name}</h2>
            <div className="cats-view-sub">{selectedCat.breed_name || 'Unknown breed'} · {selectedCat.gender}</div>
            <div className="cats-view-desc">
                {selectedCat.description || 'No personality story yet. Add a short description so other owners know what makes this cat special.'}
            </div>
            <div className="cats-chips">
                <div className="cats-chip"><span className="cats-chip-label">Breed</span><span className="cats-chip-value">{selectedCat.breed_name || '-'}</span></div>
                <div className="cats-chip"><span className="cats-chip-label">Gender</span><span className="cats-chip-value">{selectedCat.gender}</span></div>
                <div className="cats-chip"><span className="cats-chip-label">Born</span><span className="cats-chip-value">{selectedCat.birth_date ? selectedCat.birth_date.split('T')[0] : '-'}</span></div>
                <div className="cats-chip"><span className="cats-chip-label">Color</span><span className="cats-chip-value">{selectedCat.color || '-'}</span></div>
            </div>

            <div className="cats-stats">
                <div><span className="cats-stat-num">{selectedPhotos.length}</span><span className="cats-stat-label">photo{selectedPhotos.length === 1 ? '' : 's'}</span></div>
                <div><span className="cats-stat-num">{selectedVaccinations.length}</span><span className="cats-stat-label">record{selectedVaccinations.length === 1 ? '' : 's'}</span></div>
            </div>

            {selectedVaccinations.length > 0 && (
                <>
                    <div className="cats-section-title">Health Records</div>
                    <div className="cats-vacc-list">
                        {selectedVaccinations.map(v => (
                            <div className="cats-vacc-row" key={v.id}>
                                <div>
                                    <div className="cats-vacc-name">{v.vaccine_name}</div>
                                    <div className="cats-vacc-date">{v.date_given ? v.date_given.split('T')[0] : ''}</div>
                                </div>
                                {v.certificate_url && <a className="cats-vacc-cert" href={`${SERVER}${v.certificate_url}`} target="_blank" rel="noreferrer">Certificate ↗</a>}
                            </div>
                        ))}
                    </div>
                </>
            )}

            <div className="cats-actions">
                <button className="cats-btn cats-btn--primary" onClick={() => handleEdit(selectedCat)}>Edit Profile</button>
                <button className="cats-btn cats-btn--danger" onClick={() => handleDelete(selectedCat.id)}>Delete</button>
            </div>
        </>
    );

    const renderEditPanel = () => (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <span className="cats-form-eyebrow">{editingId ? 'Editing profile' : 'New profile'}</span>
            <h2 className="cats-form-title">{editingId ? `Edit ${selectedCat?.name}` : 'Introduce Cat'}</h2>

            <div className="cats-form-grid">
                <div className="cats-fg"><label>Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
                <div className="cats-fg"><label>Breed</label>
                    <select value={form.breed_id} onChange={e => setForm({ ...form, breed_id: e.target.value })}>
                        <option value="">Select breed</option>
                        {breeds.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                </div>
                <div className="cats-fg"><label>Gender</label>
                    <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                        <option value="unknown">Unknown</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>
                </div>
                <div className="cats-fg"><label>Birth Date</label><input type="date" value={form.birth_date} onChange={e => setForm({ ...form, birth_date: e.target.value })} /></div>
                <div className="cats-fg"><label>Color</label><input value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} /></div>
                <div className="cats-fg cats-fg--full"><label>Personality / Story</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            </div>

            {isAddingProfile && (
                <>
                    <div className="cats-section-title">First photo</div>
                    <label className="cats-compact-file">
                        {pendingPhoto ? pendingPhoto.name : 'Choose photo'}
                        <input type="file" accept="image/jpeg,image/png" onChange={e => setPendingPhoto(e.target.files[0])} />
                    </label>

                    <div className="cats-section-title" style={{ marginTop: 16 }}>First vaccine (optional)</div>
                    <div className="cats-vacc-form">
                        <input placeholder="Vaccine name" value={vaccineForm.vaccine_name} onChange={e => setVaccineForm({ ...vaccineForm, vaccine_name: e.target.value })} />
                        <input type="date" value={vaccineForm.date_given} onChange={e => setVaccineForm({ ...vaccineForm, date_given: e.target.value })} />
                        <label className="cats-vacc-cert-label">
                            Certificate
                            <input type="file" accept="image/jpeg,image/png,application/pdf" onChange={e => setVaccineForm({ ...vaccineForm, certificate: e.target.files[0] })} />
                        </label>
                    </div>
                </>
            )}

            {editingId && (
                <>
                    {/* Photo management */}
                    <div className="cats-section-title">Photos</div>
                    <div className="cats-photo-manage">
                        <div className="cats-photo-manage-head">
                            <div>
                                <h4>{selectedPhotos.length} photo{selectedPhotos.length === 1 ? '' : 's'}</h4>
                                <p className="cats-photo-note">Double-click a photo to set it as main.</p>
                            </div>
                        </div>
                        <div className="cats-photo-manage-grid">
                            {selectedPhotos.map(photo => (
                                <div className="cats-pm-item" key={photo.id} onDoubleClick={() => !photo.is_primary && handleSetPrimary(selectedCat.id, photo.id)}>
                                    <img src={`${SERVER}${photo.photo_url}`} alt="" />
                                    {photo.is_primary && <span className="cats-pm-badge">MAIN</span>}
                                    <div className="cats-pm-actions">
                                        <button className="cats-pm-delete-btn" type="button" aria-label="Delete photo" onClick={() => handleDeletePhoto(selectedCat.id, photo.id)}>×</button>
                                    </div>
                                </div>
                            ))}
                            <label className="cats-photo-upload-box" aria-label="Upload photo">
                                +
                                <input type="file" accept="image/jpeg,image/png" onChange={e => handlePhotoUpload(selectedCat.id, e.target.files[0])} />
                            </label>
                        </div>
                    </div>

                    {/* Vaccine management */}
                    <div className="cats-section-title">Health Records</div>
                    <div className="cats-vacc-form">
                        <input placeholder="Vaccine name" value={vaccineForm.vaccine_name} onChange={e => setVaccineForm({ ...vaccineForm, vaccine_name: e.target.value })} />
                        <input type="date" value={vaccineForm.date_given} onChange={e => setVaccineForm({ ...vaccineForm, date_given: e.target.value })} />
                        <label className="cats-vacc-cert-label">
                            Upload
                            <input type="file" accept="image/jpeg,image/png,application/pdf" onChange={e => setVaccineForm({ ...vaccineForm, certificate: e.target.files[0] })} />
                        </label>
                    </div>
                    <button type="button" className="cats-vacc-add-btn" onClick={() => handleAddVaccination({ preventDefault: () => {} }, selectedCat.id)}>+ Add Record</button>
                    <div className="cats-edit-vacc-list">
                        {selectedVaccinations.map(v => (
                            <div className="cats-edit-vacc-item" key={v.id}>
                                <div>
                                    <strong>{v.vaccine_name}</strong>
                                    <span> · {v.date_given ? v.date_given.split('T')[0] : ''}</span>
                                </div>
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                    {v.certificate_url && <a href={`${SERVER}${v.certificate_url}`} target="_blank" rel="noreferrer">Cert</a>}
                                    <button type="button" onClick={() => handleDeleteVaccination(selectedCat.id, v.id)}>✕</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            <div className="cats-form-actions" style={{ marginTop: 'auto' }}>
                <button type="submit" className="cats-btn cats-btn--gold">{editingId ? 'Save Profile' : 'Create Profile'}</button>
                <button type="button" className="cats-btn cats-btn--ghost" onClick={resetForm}>Cancel</button>
            </div>
        </form>
    );

    return (
        <main className="cats-page">
            {msg && <div className="app-toast app-toast--success">{msg}</div>}
            {error && <div className="app-toast app-toast--error">{error}</div>}

            {cats.length === 0 && !showForm ? (
                <div className="cats-empty-state">
                    <span>♡</span>
                    <h2>No cat profiles yet</h2>
                    <p>Add your first cat so the app knows who is looking for a match.</p>
                    <button onClick={startAdd}>Add Cat</button>
                </div>
            ) : (
                <div className={`cats-accordion ${catListOpen ? 'is-list-open' : 'is-list-collapsed'}`}>
                    {/* Bottom layer: active profile */}
                    {(selectedCat || isAddingProfile) && (
                        <div className="cats-expanded" key={isAddingProfile ? 'add' : selectedCat?.id}>
                            <div className="cats-gallery">{renderGallery()}</div>
                            <div className={`cats-panel ${!isAddingProfile && selectedCat?.gender === 'female' ? 'cats-panel--female' : ''} ${!isAddingProfile && selectedCat?.gender === 'unknown' ? 'cats-panel--unknown' : ''}`}>
                                {isEditingProfile ? renderEditPanel() : selectedCat ? renderViewPanel() : null}
                            </div>
                        </div>
                    )}

                    {/* Top layer: collapsible cat list */}
                    <div className={`cats-list-overlay ${catListOpen ? 'is-open' : ''}`}>
                        <button
                            type="button"
                            className="cats-list-toggle"
                            onClick={() => setCatListOpen(open => !open)}
                            aria-label={catListOpen ? 'Collapse cat list' : 'Expand cat list'}
                        >
                            {catListOpen ? '×' : '‹'}
                        </button>
                        <div className="cats-list-panel">
                            {otherCats.map(cat => {
                                const catPhotos = photos[cat.id] || [];
                                const catPrimary = catPhotos.find(p => p.is_primary) || catPhotos[0];
                                return (
                                    <div
                                        className="cats-strip"
                                        key={cat.id}
                                        onClick={() => {
                                            setSelectedCatId(cat.id);
                                            resetForm();
                                            setCatListOpen(false);
                                        }}
                                    >
                                        {catPrimary ? (
                                            <img src={`${SERVER}${catPrimary.photo_url}`} alt={cat.name} />
                                        ) : (
                                            <div className="cats-strip-ph"><span>{cat.name.charAt(0)}</span></div>
                                        )}
                                        <span className="cats-strip-label">{cat.name}</span>
                                    </div>
                                );
                            })}

                            {!showForm && (
                                <div className="cats-strip-add" onClick={startAdd}>
                                    <span>+</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}

export default Cats;
