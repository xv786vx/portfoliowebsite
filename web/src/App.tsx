
//import React from 'react'
import { Analytics } from '@vercel/analytics/react'
import SkillTree from './components/SkillTree'
import './App.css'

function App() {
  return (
    <div className="w-full h-screen">
      <Analytics />
      <SkillTree />
    </div>
  )
}

export default App
