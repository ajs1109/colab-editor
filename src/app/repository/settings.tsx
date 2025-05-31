import React from 'react';
import { useState } from 'react';
import { useRepository } from '@/hooks/useRepository';
import { updateRepositorySettings } from '@/lib/apiClient';

const SettingsPage = () => {
  const { repository, loading, error } = useRepository();
  const [settings, setSettings] = useState({
    name: repository?.name || '',
    description: repository?.description || '',
    visibility: repository?.visibility || 'public',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateRepositorySettings(repository.id, settings);
      alert('Settings updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update settings.');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error loading repository settings.</div>;

  return (
    <div>
      <h1>Repository Settings</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Name:
            <input
              type="text"
              name="name"
              value={settings.name}
              onChange={handleChange}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Description:
            <textarea
              name="description"
              value={settings.description}
              onChange={handleChange}
            />
          </label>
        </div>
        <div>
          <label>
            Visibility:
            <select
              name="visibility"
              value={settings.visibility}
              onChange={handleChange}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </label>
        </div>
        <button type="submit">Save Settings</button>
      </form>
    </div>
  );
};

export default SettingsPage;