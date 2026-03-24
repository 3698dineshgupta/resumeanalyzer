import { useState, useEffect } from 'react'
import { MapPin, Navigation, Loader2 } from 'lucide-react'
import JobList from '../jobs/JobList'
import JobFilters from '../jobs/JobFilters'
import api from '../../services/api'
import { toast } from 'react-hot-toast'

const CITIES = ['Bhubaneswar', 'Bangalore', 'Hyderabad', 'Delhi', 'Mumbai', 'Pune', 'Chennai']

export default function NearbyJobs({ onApply }) {
  const [jobs,     setJobs]     = useState([])
  const [loading,  setLoading]  = useState(false)
  const [location, setLocation] = useState('')
  const [input,    setInput]    = useState('')
  const [locating, setLocating] = useState(false)
  const [filters,  setFilters]  = useState({})

  const fetchJobs = async (loc, extra = {}) => {
    if (!loc) return
    setLoading(true)
    try {
      const { data } = await api.get('/jobs/nearby', {
        params: { location: loc, ...extra }
      })
      setJobs(data)
    } catch {
      toast.error('Failed to fetch nearby jobs')
    } finally {
      setLoading(false)
    }
  }

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by your browser')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        // In production you'd reverse-geocode lat/lng → city name
        // For now we default to Bhubaneswar as the detected city
        const detected = 'Bhubaneswar'
        setLocation(detected)
        setInput(detected)
        fetchJobs(detected)
        toast.success(`Location detected: ${detected}`)
        setLocating(false)
      },
      () => {
        toast.error('Could not detect location. Please enter your city manually.')
        setLocating(false)
      }
    )
  }

  const handleSearch = () => {
    const loc = input.trim() || 'Bhubaneswar'
    setLocation(loc)
    fetchJobs(loc, filters)
  }

  const handleFilter = f => {
    setFilters(f)
    if (location) fetchJobs(location, f)
  }

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-display font-semibold text-white mb-1">Nearby Jobs</h2>
        <p className="text-slate-400 text-sm">Jobs matched to your resume in your city</p>
      </div>

      {/* Location picker */}
      <div className="card p-4 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <MapPin size={15} className="text-brand-400" />
          <span className="text-sm font-medium text-white">Select your location</span>
        </div>

        {/* Quick city chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          {CITIES.map(city => (
            <button
              key={city}
              onClick={() => { setInput(city); setLocation(city); fetchJobs(city) }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                location === city
                  ? 'bg-brand-500 border-brand-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* Manual input + detect */}
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Enter city name…"
            className="input flex-1 text-sm"
          />
          <button onClick={detectLocation} disabled={locating} className="btn-secondary text-sm px-3">
            {locating
              ? <Loader2 size={14} className="animate-spin" />
              : <Navigation size={14} />
            }
            {locating ? 'Detecting…' : 'Detect'}
          </button>
          <button onClick={handleSearch} className="btn-primary text-sm px-4">
            Search
          </button>
        </div>
      </div>

      <JobFilters onFilter={handleFilter} />

      {!location ? (
        <div className="card p-12 text-center">
          <MapPin size={28} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">Choose a city to see nearby jobs</p>
          <p className="text-slate-600 text-sm mt-1">Or click "Detect" to use your browser location</p>
        </div>
      ) : (
        <>
          {location && (
            <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
              <MapPin size={11} /> Showing jobs in <span className="text-slate-300 font-medium">{location}</span>
            </p>
          )}
          <JobList jobs={jobs} loading={loading} onApply={onApply} emptyMessage={`No jobs found near ${location}`} />
        </>
      )}
    </div>
  )
}
