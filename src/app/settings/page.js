"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SettingsPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [twitter, setTwitter] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [medium, setMedium] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const router = useRouter();

  useEffect(() => {
    // Fetch Current User Settings
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          const u = data.user;
          setFullName(u.fullName || "");
          setEmail(u.email || "");
          setBio(u.bio || "");
          setTwitter(u.twitter || "");
          setLinkedin(u.linkedin || "");
          setMedium(u.medium || "");
          setProfileImage(u.profileImage || "");
          setProfileImagePreview(u.profileImage || "");
          setLoading(false);
        } else {
          router.push("/login");
        }
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onload = (e2) => setProfileImagePreview(e2.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    let currentImageUrl = profileImage;

    try {
      // 1. Upload profile image if a new one is selected
      if (profileImageFile) {
        const formData = new FormData();
        formData.append("file", profileImageFile);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.success) {
          currentImageUrl = uploadData.url;
          setProfileImage(uploadData.url);
        } else {
          setError(uploadData.error || "Failed to upload profile picture");
          setSaving(false);
          return;
        }
      }

      // 2. Save all settings details
      const payload = {
        fullName,
        email,
        bio,
        twitter,
        linkedin,
        medium,
        profileImage: currentImageUrl,
      };

      if (newPassword) {
        if (newPassword !== confirmPassword) {
          setError("Passwords do not match");
          setSaving(false);
          return;
        }
        payload.newPassword = newPassword;
        payload.confirmPassword = confirmPassword;
      }

      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess("Settings saved successfully!");
        setNewPassword("");
        setConfirmPassword("");
        router.refresh();
      } else {
        setError(data.error || "Failed to save settings");
      }
    } catch (err) {
      setError("An error occurred while saving your settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!confirm("Are you sure you want to permanently delete your account? This is irreversible and all your articles will be deleted.")) {
      return;
    }

    try {
      const res = await fetch("/api/user/settings", {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok && data.success) {
        alert("Account deleted successfully!");
        router.push("/");
        router.refresh();
      } else {
        alert(data.error || "Failed to delete account");
      }
    } catch (err) {
      alert("Error deleting account. Please try again.");
    }
  };

  return (
    <>
      <Header />
      
      <main className="settings-main-content">
        <div className="settings-container">
          <h2 className="settings-page-heading" style={{ fontFamily: "'DM Serif Display', serif" }}>Settings</h2>

          {loading ? (
            <p style={{ textAlign: "center", padding: "50px" }}>Loading settings profile...</p>
          ) : (
            <>
              {error && <div style={{ color: "red", marginBottom: "20px", fontWeight: "600" }}>❌ {error}</div>}
              {success && <div style={{ color: "green", marginBottom: "20px", fontWeight: "600" }}>✅ {success}</div>}

              <form onSubmit={handleSaveSettings}>
                {/* User Info */}
                <section className="settings-section user-info-section">
                  <h3 className="section-heading">User Information</h3>
                  
                  <div className="profile-picture-container" style={{ cursor: "pointer", position: "relative" }}>
                    <img 
                      src={profileImagePreview || "https://api.dicebear.com/7.x/initials/svg?seed=" + fullName} 
                      alt="Profile Picture" 
                      className="profile-picture" 
                      id="profilePicPreview"
                      style={{ objectFit: "cover" }}
                    />
                    <span className="avatar-placeholder" id="avatarPlaceholder" style={{ pointerEvents: "none" }}>
                      Upload<br />Profile<br />Picture
                    </span>
                    <input 
                      type="file" 
                      id="profile_image" 
                      accept="image/*" 
                      onChange={handleImageChange}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        opacity: 0,
                        cursor: "pointer",
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="full_name">Full Name</label>
                    <input 
                      type="text" 
                      id="full_name" 
                      placeholder="Your full name" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input 
                      type="email" 
                      id="email" 
                      placeholder="you@example.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="bio">About Me</label>
                    <textarea 
                      id="bio" 
                      rows="4" 
                      placeholder="Tell us about yourself…"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    ></textarea>
                  </div>
                </section>

                {/* Social Links */}
                <section className="settings-section social-links-section">
                  <h3 className="section-heading">Social Links</h3>
                  <div className="form-group">
                    <label htmlFor="twitter">Twitter</label>
                    <input 
                      type="text" 
                      id="twitter" 
                      placeholder="https://twitter.com/username"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="linkedin">LinkedIn</label>
                    <input 
                      type="text" 
                      id="linkedin" 
                      placeholder="https://linkedin.com/in/username"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="medium">Medium</label>
                    <input 
                      type="text" 
                      id="medium" 
                      placeholder="https://medium.com/@username"
                      value={medium}
                      onChange={(e) => setMedium(e.target.value)}
                    />
                  </div>
                </section>

                {/* Password Change */}
                <section className="settings-section account-settings-section">
                  <h3 className="section-heading">Change Password</h3>
                  <div className="form-group">
                    <label htmlFor="new_password">New Password</label>
                    <input 
                      type="password" 
                      id="new_password" 
                      placeholder="Leave blank to keep current password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="confirm_password">Confirm New Password</label>
                    <input 
                      type="password" 
                      id="confirm_password" 
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </section>

                <button 
                  type="submit" 
                  className="save-button" 
                  disabled={saving}
                  style={{ cursor: saving ? "not-allowed" : "pointer" }}
                >
                  {saving ? "Saving Changes..." : "Save All Changes"}
                </button>
              </form>

              {/* Delete Account */}
              <section className="settings-section delete-account-section">
                <p className="warning-text">Deleting your account is permanent and cannot be undone.</p>
                <form onSubmit={handleDeleteAccount}>
                  <button type="submit" className="delete-button" style={{ cursor: "pointer" }}>
                    Delete My Account
                  </button>
                </form>
              </section>
            </>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
