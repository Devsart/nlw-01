import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import './styles.css';
import logo from '../../assets/logo.svg';
import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import api from '../../services/api';
import axios from 'axios';
import { LeafletMouseEvent } from 'leaflet';
import Dropzone from '../../components/Dropzone';


const CreatePoint = () => {
    //sempre que criar estado para array ou objeto, declarar tipo
    interface Item {
        id: number,
        title: string,
        img_url: string
    }
    interface UF {
        sigla: string
    }
    interface City {
        nome: string
    }
    const [items,setItems] = useState<Item[]>([]);
    const [ufs,setUfs] = useState<string[]>([]);
    const [selectedUF,setSelectedUF] = useState('0');
    const [cities,setCities] = useState<string[]>([])
    const [selectedCity,setSelectedcity] = useState('0');
    const [initialPosition,setInitialposition] = useState<[number,number]>([0,0]);
    const [selectedPosition, setSelectedposition] = useState<[number,number]>([0,0]);
    const [formData,setFormdata] = useState({
        name:'',
        email:'',
        whatsapp:''
    })
    const [selectedItems,setSelecteditems] = useState<number[]>([])
    const [selectedFile, setSelectedfile] = useState<File>();

    useEffect(()=>{
        api.get('items').then(response => {
            setItems(response.data);
        })
    }, [])
    useEffect(()=>{
        axios.get<UF[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
            const ufInitials = response.data.map(uf => uf.sigla);
            setUfs(ufInitials)
        })
    }, [])
    useEffect(()=>{
        if(selectedUF === '0'){
            return
        }
        else{
            axios.get<City[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUF}/municipios`).then(response => {
                const city = response.data.map(city => city.nome);
                setCities(city)
            })
        }
    },[selectedUF])

    useEffect(()=>{
        navigator.geolocation.getCurrentPosition(position =>{
            const { latitude,longitude } = position.coords;
            setInitialposition([latitude,longitude]);
        })
    },[])

    function handleSelectedUF(event: ChangeEvent<HTMLSelectElement>){
            const uf = event.target.value

            setSelectedUF(uf);
    }
    function handleSelectedcity(event: ChangeEvent<HTMLSelectElement>){
        const city = event.target.value

        setSelectedcity(city);
    }
    function handleMapClick(event: LeafletMouseEvent){
        setSelectedposition(
            [event.latlng.lat,
            event.latlng.lng])
    }
    function handleInputChange(event:ChangeEvent<HTMLInputElement>){
        const {name,value} = event.target;
        setFormdata({...formData,[name]:value})
    }
    function handleSelecteditems(id: number){
        const alreadySelected = selectedItems.findIndex(item => item === id);

        if(alreadySelected >= 0){
            const filteredItems = selectedItems.filter(item => item !== id);
            setSelecteditems(filteredItems);
        }
        else{
            setSelecteditems([...selectedItems,id])
        }
    }

    async function handleSubmit(event: FormEvent){
        event.preventDefault();
        const { name,email,whatsapp } = formData;
        const uf = selectedUF;
        const city = selectedCity;
        const [latitude,longitude] = selectedPosition;
        const items = selectedItems

        const data = new FormData();
            data.append('name', name)
            data.append('email', email)
            data.append('whatsapp', whatsapp)
            data.append('uf',uf)
            data.append('city',city)
            data.append('latitude',String(latitude))
            data.append('longitude',String(longitude))
            data.append('items',items.join(','))

        if(selectedFile){
            data.append('image',selectedFile)
        }
        await api.post('points',data);
        alert('Ponto criado!');
    }

    return(
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>
                <Link to="/">
                    <FiArrowLeft />
                    Voltar para início
                </Link>
            </header>
            <form onSubmit={handleSubmit}>
                <h1>Cadastro do<br /> Ponto de Coleta</h1>
                <Dropzone onFileUpload={setSelectedfile}/>
                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input type="text" name="name" id="name" onChange={handleInputChange}/>
                    </div>
                    <div className="field-group">
                    <div className="field">
                        <label htmlFor="email">E-mail</label>
                        <input type="email" name="email" id="email" onChange={handleInputChange}/>
                    </div>
                    <div className="field">
                        <label htmlFor="whatsapp">Whatsapp</label>
                        <input type="number" name="whatsapp" id="whatsapp" onChange={handleInputChange}/>
                    </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>
                    <Map center={initialPosition} zoom={19} onClick={handleMapClick}>
                        <TileLayer attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={selectedPosition} />
                    </Map>
                    <div className="field-group">
                    <div className="field">
                        <label htmlFor="uf">Estado(UF)</label>
                        <select name="uf" id="uf" value={selectedUF} onChange={handleSelectedUF}>
                            <option value="0">Selecione uma UF</option>
                            {ufs.map(uf =>(
                                <option key={uf} value={uf}>{uf}</option>
                            ))}
                        </select>
                    </div>
                    <div className="field">
                        <label htmlFor="city">Cidade</label>
                        <select name="city" id="city" value={selectedCity} onChange={handleSelectedcity}>
                            <option value="0">Selecione uma cidade</option>
                            {cities.map(city =>(
                                <option key={city} value={city}>{city}</option>
                            ))}
                        </select>
                    </div>
                    </div>
                </fieldset>
                <fieldset>
                    <legend>
                        <h2>Itens de Coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>
                    <ul className="items-grid">
                        {items.map(item => (<li key={item.id} 
                        onClick={() => handleSelecteditems(item.id)}
                        className={selectedItems.includes(item.id) ? 'selected' : ''}>
                            <img src={item.img_url} alt={item.title}/>
                            <span>{item.title}</span>
                        </li>))}
                        
                    </ul>
                </fieldset>
                <button type="submit">
                    Cadastrar ponto de coleta
                </button>
            </form>
        </div>
    )
}

export default CreatePoint;