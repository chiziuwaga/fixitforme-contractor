"use client"

import { useState, useEffect } from "react"
import { Box, Typography, Button, CircularProgress, Alert } from "@mui/material"
import { useAuth } from "../../contexts/AuthContext"
import { getSubscriptionStatus, cancelSubscription } from "../../api/subscriptionApi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const SubscriptionManager = () => {
  const { currentUser } = useAuth()
  const [subscriptionStatus, setSubscriptionStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      setLoading(true)
      try {
        if (currentUser) {
          const status = await getSubscriptionStatus(currentUser.uid)
          setSubscriptionStatus(status)
        }
      } catch (err) {
        setError("Failed to fetch subscription status.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscriptionStatus()
  }, [currentUser])

  const handleCancelSubscription = async () => {
    setCancelLoading(true)
    setError("")
    setSuccessMessage("")

    try {
      if (currentUser && subscriptionStatus?.subscriptionId) {
        await cancelSubscription(currentUser.uid, subscriptionStatus.subscriptionId)
        setSubscriptionStatus({ ...subscriptionStatus, status: "canceled" })
        setSuccessMessage("Subscription successfully canceled.")
      } else {
        setError("No active subscription found to cancel.")
      }
    } catch (err) {
      setError("Failed to cancel subscription.")
      console.error(err)
    } finally {
      setCancelLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Manager</CardTitle>
      </CardHeader>
      <CardContent>
        <Box sx={{ padding: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {subscriptionStatus ? (
                <>
                  <Typography>Status: {subscriptionStatus.status || "Inactive"}</Typography>
                  <Typography>Subscription ID: {subscriptionStatus.subscriptionId || "N/A"}</Typography>
                  {subscriptionStatus.status === "active" && (
                    <Button
                      variant="contained"
                      color="error"
                      onClick={handleCancelSubscription}
                      disabled={cancelLoading}
                      sx={{ mt: 2 }}
                    >
                      {cancelLoading ? <CircularProgress size={24} color="inherit" /> : "Cancel Subscription"}
                    </Button>
                  )}
                  {subscriptionStatus.status === "canceled" && (
                    <Typography mt={2}>Your subscription has been canceled.</Typography>
                  )}
                </>
              ) : (
                <Typography>No subscription found.</Typography>
              )}
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default SubscriptionManager
