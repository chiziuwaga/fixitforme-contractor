"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import styled from "styled-components"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFileUpload, faCheckCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const getColor = (props: any) => {
  if (props.isDragAccept) {
    return "#00e676"
  }
  if (props.isDragReject) {
    return "#ff1744"
  }
  if (props.isFocused) {
    return "#2196f3"
  }
  return "#eeeeee"
}

const Container = styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    border-width: 2px;
    border-radius: 2px;
    border-color: ${(props) => getColor(props)};
    border-style: dashed;
    background-color: #fafafa;
    color: #bdbdbd;
    outline: none;
    transition: border .24s ease-in-out;
    cursor: pointer;
    width: 100%;
    box-sizing: border-box;
`

const UploadIcon = styled(FontAwesomeIcon)`
    font-size: 3em;
    margin-bottom: 10px;
    color: #9e9e9e;
`

const UploadedFileContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 10px;
    margin-top: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #f9f9f9;
`

const FileName = styled.span`
    flex-grow: 1;
    margin-right: 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`

const SuccessIcon = styled(FontAwesomeIcon)`
    color: green;
    margin-right: 5px;
`

const FailureIcon = styled(FontAwesomeIcon)`
    color: red;
    margin-right: 5px;
`

const RemoveButton = styled.button`
    background-color: #f44336;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 5px;
    cursor: pointer;
    &:hover {
        background-color: #d32f2f;
    }
`

const DocumentUploader: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const supportedFormats = ["pdf", "doc", "docx"]

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]

    if (file) {
      const fileExtension = file.name.split(".").pop()?.toLowerCase()
      if (supportedFormats.includes(fileExtension || "")) {
        setUploadedFile(file)
        setUploadError(null)
        // Assuming onDocumentUploaded is a function that needs to be called with the file
        console.log("File uploaded:", file)
      } else {
        setUploadedFile(null)
        setUploadError(`Unsupported file format. Supported formats: ${supportedFormats.join(", ")}`)
      }
    }
  }, [])

  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject, open } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    onDrop,
    noClick: true,
    noKeyboard: true,
  })

  const handleRemoveFile = () => {
    setUploadedFile(null)
    setUploadError(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Uploader</CardTitle>
      </CardHeader>
      <CardContent>
        <Container {...getRootProps({ isFocused, isDragAccept, isDragReject })}>
          <input {...getInputProps()} />
          <UploadIcon icon={faFileUpload} />
          <p>Drag 'n' drop a document here, or click to select a file</p>
          <p>(Only {supportedFormats.join(", ")} files will be accepted)</p>
          <button type="button" onClick={open}>
            Select File
          </button>
        </Container>
        {uploadedFile && (
          <UploadedFileContainer>
            <SuccessIcon icon={faCheckCircle} />
            <FileName>{uploadedFile.name}</FileName>
            <RemoveButton onClick={handleRemoveFile}>Remove</RemoveButton>
          </UploadedFileContainer>
        )}
        {uploadError && (
          <UploadedFileContainer>
            <FailureIcon icon={faTimesCircle} />
            <FileName>{uploadError}</FileName>
            <RemoveButton onClick={handleRemoveFile}>Remove</RemoveButton>
          </UploadedFileContainer>
        )}
      </CardContent>
    </Card>
  )
}

export default DocumentUploader
