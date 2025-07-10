"use client"

import { useState, useEffect } from "react"
import { TextField, Button, Grid, Avatar, Typography, Box, CircularProgress } from "@mui/material"
import { styled } from "@mui/system"
import { useAuth } from "../../contexts/AuthContext"
import { updateProfile, getCurrentUser } from "../../firebase"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
})

export default function ProfileEditor() {
  const { currentUser } = useAuth()
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [photoURL, setPhotoURL] = useState("")
  const [newPhoto, setNewPhoto] = useState(null)
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      try {
        if (currentUser) {
          const user = await getCurrentUser()
          if (user) {
            setDisplayName(user.displayName || "")
            setEmail(user.email || "")
            setPhotoURL(user.photoURL || "")
          }
        }
      } catch (err) {
        setError("Failed to load profile.")
        console.error("Error fetching profile:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [currentUser])

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      setNewPhoto(file)
      // Optionally, display a preview of the image
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoURL(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError("")
    setSuccessMessage("")

    try {
      let newPhotoURL = photoURL

      if (newPhoto) {
        const storage = getStorage()
        const storageRef = ref(storage, `profile-images/${currentUser.uid}/${newPhoto.name}`)
        await uploadBytes(storageRef, newPhoto)
        newPhotoURL = await getDownloadURL(storageRef)
      }

      await updateProfile({
        displayName,
        photoURL: newPhotoURL,
      })

      setSuccessMessage("Profile updated successfully!")
    } catch (err) {
      setError("Failed to update profile.")
      console.error("Error updating profile:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Editor</CardTitle>
      </CardHeader>
      <CardContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: "100%" }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <Avatar src={photoURL} sx={{ width: 100, height: 100, margin: "0 auto" }} />
              <Button
                component="label"
                variant="contained"
                sx={{ mt: 2, display: "block", margin: "0 auto", width: "fit-content" }}
              >
                Upload new photo
                <VisuallyHiddenInput type="file" onChange={handleFileChange} />
              </Button>
            </Grid>
            <Grid item xs={12} sm={8}>
              {error && (
                <Typography color="error" align="center">
                  {error}
                </Typography>
              )}
              {successMessage && (
                <Typography color="success" align="center">
                  {successMessage}
                </Typography>
              )}
              <TextField
                fullWidth
                label="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                margin="normal"
                variant="outlined"
              />
              <TextField fullWidth label="Email" value={email} margin="normal" variant="outlined" disabled />
              <Button type="submit" variant="contained" color="primary" disabled={loading} sx={{ mt: 2 }}>
                {loading ? <CircularProgress size={24} color="inherit" /> : "Update Profile"}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  )
}
