import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabaseClient'
import Document from './Document'

export default function Account({ session }) {
  const [loading, setLoading] = useState(true)
  const [phone, setPhone] = useState(null)
  const [first_name, setFirstName] = useState(null)
  const [last_name, setLastName] = useState(null)
  const [country, setCountry] = useState(null)
  const [city, setCity] = useState(null)
  const [doc_url, setDocumentUrl] = useState(null)

  useEffect(() => {
    getProfile()
  }, [session])

  async function getProfile() {
    try {
      setLoading(true)
      const user = supabase.auth.user()

      let { data, error, status } = await supabase
        .from('profiles')
        .select(`phone, first_name, last_name, country, city, doc_url`)
        .eq('id', user.id)
        .single()

      if (error && status !== 406) {
        throw error
      }

      if (data) {
        setPhone(data.phone)
        setFirstName(data.first_name)
        setLastName(data.last_name)
        setCountry(data.country)
        setCity(data.city)
        setDocumentUrl(data.doc_url)
      }
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile() {
    try {
      setLoading(true)
      const user = supabase.auth.user()

      const updates = {
        id: user.id,
        phone, 
        first_name, 
        last_name, 
        country, 
        city, 
        doc_url,
        updated_at: new Date(),
      }

      let { error } = await supabase.from('profiles').upsert(updates, {
        returning: 'minimal', // Don't return the value after inserting
      })

      if (error) {
        throw error
      }
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-widget">
      <div className="headtext">Please put your information here</div>
      <Document
      url={doc_url}
      size={150}
      onUpload={(url) => {
        setDocumentUrl(url)
        updateProfile({ phone, first_name, last_name, country, city, doc_url: url})
      }}
    />
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="text" value={session.user.email} disabled />
      </div>
      <div>
        <label htmlFor="phone">Phone</label>
        <input
          id="phone"
          type="text"
          value={phone || ''}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="first_name">First name</label>
        <input
          id="first_name"
          type="first_name"
          value={first_name || ''}
          onChange={(e) => setFirstName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="last_name">Last name</label>
        <input
          id="last_name"
          type="last_name"
          value={last_name || ''}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="country">Country</label>
        <input
          id="country"
          type="country"
          value={country || ''}
          onChange={(e) => setCountry(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="city">City</label>
        <input
          id="city"
          type="city"
          value={city || ''}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>

      <div>
        <button
          className="button block primary"
          onClick={() => updateProfile({ phone, first_name, last_name, country, city, doc_url})}
          disabled={loading}
        >
          {loading ? 'Loading ...' : 'Update'}
        </button>
      </div>

      <div>
        <button className="button block" onClick={() => supabase.auth.signOut()}>
          Sign Out
        </button>
      </div>
    </div>
  )
}
    