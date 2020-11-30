import React, {useState, useContext, useEffect} from 'react';
import axios from 'axios'
import { GlobalState} from '../../../GlobalState'
import Loading from '../utils/loading/Loading'
import {useHistory, useParams} from 'react-router-dom'

const initialState = {
  product_id: '',
  title: '',
  price: 0,
  description: 'Test',
  content: 'Test',
  category: '',
  _id: ''
}
 
function CreateProduct() {
  const state = useContext(GlobalState)
  const [product, setProduct] = useState(initialState)
  const [categories] = state.categoriesAPI.categories
  const [images, setImages] = useState(false)
  const [loading, setLoading] = useState(false)

  const[isAdmin] = state.UserAPI.isAdmin
  const[token] = state.token

  const history = useHistory()
  const params = useParams()

  const [products, setProducts] = state.productsAPI.products
  const [onEdit, setOnEdit] = useState(false)
  useEffect(() => {
    if(params.id){
      setOnEdit(true)
      products.forEach(product => {
        if(product._id === params.id) {
          setProduct(product)
          setImages(product.images)
        }
      })
    }else{
      setOnEdit(false)
      setProduct(initialState)
      setImages(false)
    }
  },[params.id, products, setProducts])

  const handleUpload = async e => {
    e.preventDefault()
    try {
      if(!isAdmin) return alert("You're not and admin")
      const file = e.target.files[0]
    
      if(!file) return alert("File not exist.")

      if(file.size > 1024 * 1024) // 1mb
        return alert("Size too large!")
      
      // if(file.type !== 'images/jpge' && file.type !== 'images/png') 
      //   return alert("File format is incorrect")

      let formData = new FormData()
      formData.append('file', file)

      setLoading(true)
      const res = await axios.post('/api/upload', formData, {
        headers: {'content-type': 'multipart/form-data', Authorization :token}
      })
      setLoading(false)
      setImages(res.data)
      
    } catch (error) {
      alert(error.response.data.msg)
    }
  }

  const handleDestroy = async () => {
    try {
      if(!isAdmin) return alert("You're not an admin")
      setLoading(true)
      await axios.post('/api/destroy', {public_id: images.public_id},{
        headers: {Authorization: token}
      })

      setLoading(true)
      setImages(false)
    } catch (error) {
      alert(error.response.data.msg)
    }
  }

  const handleChangeInput = e => {
    const {name, value} = e.target
    setProduct({...product, [name]: value})
  }

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      if(!isAdmin) return alert("You're not an admin")
      if(!images) return alert("No image Upload")

      if(onEdit){
        await axios.put(`/api/products/${product._id}`, {...product, images},{
          headers: {Authorization: token}
        })
      }else{
        await axios.post('/api/products', {...product, images},{
          headers: {Authorization: token}
        })
      }
      

      setImages(false)
      setProduct(initialState)
      history.push("/")

    } catch (error) {
      alert(error.response.data.msg)
    }
  }


  const styleUpload = {
    display: images ? "block": "none"
  }

  return (
    <div className="create_product">
        <div className="upload">
            <input type="file" name="file" id="file_up" onChange={handleUpload}/>
            {
              loading ?  <div id="file_img"><Loading /></div>

              :  <div id="file_img" style={styleUpload}>
                <img src={images ? images.url : ''} alt=""/>
                <span onClick={handleDestroy} >X</span>
            </div>
            }
          
        </div>

        <form onSubmit={handleSubmit}>
          <div className="row">
            <label htmlFor="product_id">Product ID</label>
            <input type="text" name="product_id" id="product_id"
            value={product.product_id} onChange={handleChangeInput} disabled={onEdit}/>
          </div>

          <div className="row">
            <label htmlFor="title">Title</label>
            <input type="text" name="title" id="title"
            value={product.title}  onChange={handleChangeInput}/>
          </div>

          <div className="row">
            <label htmlFor="price">Price</label>
            <input type="number" name="price" id="price"
            value={product.price}  onChange={handleChangeInput}/>
          </div>

          <div className="row">
            <label htmlFor="description">Description</label>
            <textarea type="text" name="description" id="description"  onChange={handleChangeInput}
            value={product.description} rows="5"/>
          </div>

          <div className="row">
            <label htmlFor="content">Content</label>
            <textarea type="text" name="content" id="content"  onChange={handleChangeInput}
            value={product.content} rows="7"/>
          </div>

          <div className="row">
            <label htmlFor="categories">Categories : </label>
            <select name="category" value={product.category}
            onChange={handleChangeInput} 
            >
              <option value="">Plase select a category</option>
              {
                categories.map(category => (
                  <option value={category._id} key={category._id}>
                      {category.name}
                  </option>
                ))
              }
            </select>
          </div>
          
            <button type="submit">{onEdit ? "Update" : "Create"}</button>
        </form>
    </div>
  );
}

export default CreateProduct;