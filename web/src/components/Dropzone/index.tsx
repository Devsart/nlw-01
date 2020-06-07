import React, {useCallback, useState} from 'react'
import {useDropzone} from 'react-dropzone'
import './styles.css';
import { FiUpload } from 'react-icons/fi'

interface Props{
    onFileUpload: (file: File) => void;
}

const Dropzone: React.FC<Props> = ({onFileUpload}) => {
    const  [selectedfileUrl,setSelectedfileurl] = useState('')

  const onDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];
    const fileurl = URL.createObjectURL(file);
    setSelectedfileurl(fileurl)
    onFileUpload(file);
  }, [onFileUpload])
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop, accept:"image/*"})

  return (
    <div className="dropzone" {...getRootProps()}>
      <input {...getInputProps()} accept="image/*" />
      {selectedfileUrl ?
      <img src={selectedfileUrl} alt="Point thumbnail"/>
      : 
        isDragActive ?
          <p><FiUpload />Solte sua imagem aqui ...</p> :
          <p><FiUpload />Arraste e solte a imagem de seu ponto, ou clique aqui para selecionar o arquivo</p>
      
      }
    </div>
  )
}

export default Dropzone;