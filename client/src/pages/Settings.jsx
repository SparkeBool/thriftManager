// client/src/pages/Settings.jsx
import React from 'react'

const Settings = () => {
  return (
    <div className="container py-5">
      <h1>Settings</h1>
      <form className="mt-4">
        <div className="mb-3">
          <label className="form-label">Notification Preferences</label>
          <select className="form-select">
            <option>Email</option>
            <option>SMS</option>
            <option>Push Notifications</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary">Save Settings</button>
      </form>
    </div>
  )
}

export default Settings
