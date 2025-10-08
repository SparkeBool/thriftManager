// client/src/pages/Profile.jsx
import React from 'react'

const Profile = () => {
  return (
    <div className="container py-5">
      <h1>Profile</h1>
      <div className="card mt-4">
        <div className="card-body">
          <h5 className="card-title">John Doe</h5>
          <p className="card-text">Email: john@example.com</p>
          <button className="btn btn-secondary">Edit Profile</button>
        </div>
      </div>
    </div>
  )
}

export default Profile
