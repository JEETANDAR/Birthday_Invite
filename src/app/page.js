"use client"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import localFont from "next/font/local"

const ClimateCrisis = localFont({
  src: "../../public/fonts/Climate_Crisis/ClimateCrisis-Regular-VariableFont_YEAR.ttf",
})

const Honk = localFont({
  src: "../../public/fonts/Honk/Honk-Regular-VariableFont_MORF,SHLN.ttf",
})

const Micro5 = localFont({
  src: "../../public/fonts/Micro_5/Micro5-Regular.ttf",
})

const Nabla = localFont({
  src: "../../public/fonts/Nabla/Nabla-Regular-VariableFont_EDPT,EHLT.ttf",
})

const ComicNeue = localFont({
  src: "../../public/fonts/Comic_Neue/ComicNeue-Regular.ttf",
})

export default function Home() {
  const confettiRef = useRef(null)
  const songFileInputRef = useRef(null)
  const photoFileInputRef = useRef(null)
  const cakeCanvasRef = useRef(null)
  const gameCanvasRef = useRef(null)
  
  const [songs, setSongs] = useState([
    "I Gotta Feeling",
    "APT.",
    "On The Floor (Radio Edit)",
    "We Found Love",
    "Calm Down",
    "Middle",
  ])
  
  const [photos, setPhotos] = useState([])
  const [isSongUploading, setIsSongUploading] = useState(false)
  const [isPhotoUploading, setIsPhotoUploading] = useState(false)
  const [timeLeft, setTimeLeft] = useState({ days: 10, hours: 19, minutes: 30, seconds: 10 })
  const [giftAmount, setGiftAmount] = useState(10)
  const [gameScore, setGameScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [cakeCandlesLit, setCakeCandlesLit] = useState(false)
  const [activeFeature, setActiveFeature] = useState(null) // null, 'countdown', 'gift', 'game', 'soundtrack', 'cake', 'quiz'

  // Countdown timer
 // Countdown timer
useEffect(() => {
  const calculateTimeLeft = () => {
    const now = new Date()
    const targetDate = new Date('2025-05-07T19:00:00') // May 7, 2025 at 7 PM
    const difference = targetDate - now
    
    if (difference > 0) {
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      })
    }
  }
  
  calculateTimeLeft()
  const timer = setInterval(calculateTimeLeft, 1000)
  
  return () => clearInterval(timer)
}, [])


  // Mini-game setup
  useEffect(() => {
    if (!gameCanvasRef.current || !gameStarted) return
    
    const canvas = gameCanvasRef.current
    const ctx = canvas.getContext('2d')
    let animationFrameId
    let gameObjects = []
    
    // Simple retro game - collect falling presents
    class GameObject {
      constructor(x, y, width, height, color, type) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.color = color
        this.type = type // 'present' or 'bomb'
        this.speed = Math.random() * 3 + 1
      }
      
      draw() {
        ctx.fillStyle = this.color
        if (this.type === 'present') {
          ctx.fillRect(this.x, this.y, this.width, this.height)
          ctx.fillStyle = '#fff'
          ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, 5)
          ctx.fillRect(this.x + this.width/2 - 2.5, this.y, 5, this.height)
        } else {
          // Draw bomb
          ctx.beginPath()
          ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = '#000'
          ctx.fillRect(this.x + this.width/2 - 2, this.y + this.height/2 + 5, 4, 10)
        }
      }
      
      update() {
        this.y += this.speed
        if (this.y > canvas.height) {
          if (this.type === 'present') {
            // Missed present - small penalty
            setGameScore(prev => Math.max(0, prev - 1))
          }
          return false
        }
        return true
      }
    }
    
    // Player (bucket to catch presents)
    const player = {
      x: canvas.width / 2 - 25,
      y: canvas.height - 30,
      width: 50,
      height: 20,
      speed: 8,
      color: '#FF5252',
      dx: 0,
      draw() {
        ctx.fillStyle = this.color
        ctx.fillRect(this.x, this.y, this.width, this.height)
        // Handle
        ctx.beginPath()
        ctx.moveTo(this.x + 10, this.y)
        ctx.lineTo(this.x + 15, this.y - 10)
        ctx.lineTo(this.x + 35, this.y - 10)
        ctx.lineTo(this.x + 40, this.y)
        ctx.fill()
      },
      update() {
        if (this.dx !== 0) {
          this.x += this.dx
          if (this.x < 0) this.x = 0
          if (this.x + this.width > canvas.width) this.x = canvas.width - this.width
        }
      }
    }
    
    // Handle keyboard
    const keys = {}
    window.addEventListener('keydown', (e) => {
      keys[e.key] = true
      if (e.key === 'ArrowLeft') player.dx = -player.speed
      if (e.key === 'ArrowRight') player.dx = player.speed
    })
    
    window.addEventListener('keyup', (e) => {
      keys[e.key] = false
      if (e.key === 'ArrowLeft' && player.dx < 0) player.dx = 0
      if (e.key === 'ArrowRight' && player.dx > 0) player.dx = 0
    })
    
    // Game loop
    let lastSpawnTime = 0
    const spawnRate = 1000 // ms
    
    const gameLoop = (timestamp) => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Spawn new objects
      if (timestamp - lastSpawnTime > spawnRate) {
        const type = Math.random() > 0.2 ? 'present' : 'bomb'
        const color = type === 'present' ? 
          `hsl(${Math.random() * 360}, 70%, 60%)` : '#333'
        
        gameObjects.push(new GameObject(
          Math.random() * (canvas.width - 30),
          -30,
          30,
          30,
          color,
          type
        ))
        lastSpawnTime = timestamp
      }
      
      // Update and draw objects
      gameObjects = gameObjects.filter(obj => {
        const stillActive = obj.update()
        
        // Check collision with player
        if (stillActive &&
            obj.y + obj.height > player.y &&
            obj.x < player.x + player.width &&
            obj.x + obj.width > player.x) {
          if (obj.type === 'present') {
            setGameScore(prev => prev + 5)
          } else {
            setGameScore(prev => Math.max(0, prev - 10))
          }
          return false
        }
        
        if (stillActive) obj.draw()
        return stillActive
      })
      
      // Update and draw player
      player.update()
      player.draw()
      
      // Draw score
      ctx.fillStyle = '#000'
      ctx.font = '20px Arial'
      ctx.fillText(`Score: ${gameScore}`, 10, 30)
      
      animationFrameId = requestAnimationFrame(gameLoop)
    }
    
    animationFrameId = requestAnimationFrame(gameLoop)
    
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('keydown', () => {})
      window.removeEventListener('keyup', () => {})
    }
  }, [gameStarted, gameScore])

  // Virtual cake interaction
  // useEffect(() => {
  //   if (!cakeCanvasRef.current) return
    
  //   const canvas = cakeCanvasRef.current
  //   const ctx = canvas.getContext('2d')
    
  //   // Draw cake
  //   const drawCake = () => {
  //     // Cake base
  //     ctx.fillStyle = '#F9C5C5'
  //     ctx.beginPath()
  //     ctx.roundRect(50, 100, 200, 100, [0, 0, 20, 20])
  //     ctx.fill()
      
  //     // Frosting
  //     ctx.fillStyle = '#FFEBEE'
  //     ctx.beginPath()
  //     ctx.roundRect(50, 80, 200, 20, [20, 20, 0, 0])
  //     ctx.fill()
      
  //     // Candles
  //     for (let i = 0; i < 5; i++) {
  //       ctx.fillStyle = cakeCandlesLit ? '#FFD700' : '#888'
  //       ctx.fillRect(80 + (i * 30), 50, 10, 30)
        
  //       if (cakeCandlesLit) {
  //         // Flame
  //         ctx.fillStyle = '#FF5252'
  //         ctx.beginPath()
  //         ctx.arc(85 + (i * 30), 45, 5, 0, Math.PI * 2)
  //         ctx.fill()
  //       }
  //     }
      
  //     // Message
  //     ctx.fillStyle = '#000'
  //     ctx.font = '16px Arial'
  //     ctx.fillText(cakeCandlesLit ? 'Make a wish!' : 'Click to light candles!', 80, 180)
  //   }
    
  //   // Handle clicks
  //   const handleClick = (e) => {
  //     const rect = canvas.getBoundingClientRect()
  //     const x = e.clientX - rect.left
  //     const y = e.clientY - rect.top
      
  //     // Check if click is near candles
  //     if (y >= 50 && y <= 80 && x >= 80 && x <= 230) {
  //       setCakeCandlesLit(true)
  //       setTimeout(() => setCakeCandlesLit(false), 5000) // Candles go out after 5 seconds
  //     }
  //   }
    
  //   canvas.addEventListener('click', handleClick)
  //   drawCake()
    
  //   return () => {
  //     canvas.removeEventListener('click', handleClick)
  //   }
  // }, [cakeCandlesLit])

  const handleMouseMove = (event) => {
    if (!confettiRef.current) return

    for (let i = 0; i < 3; i++) {
      const container = confettiRef.current
      const confetti = document.createElement("div")
      confetti.classList.add("confetti")
      container.appendChild(confetti)

      const randomX = Math.floor(Math.random() * 30)
      const randomY = Math.floor(Math.random() * 30)
      confetti.style.position = "absolute"
      confetti.style.left = `${event.pageX + randomX}px`
      confetti.style.top = `${event.pageY + randomY}px`

      const randomColor = Math.floor(Math.random() * 256)
      confetti.style.backgroundColor = `rgb(255, 255, ${randomColor})`

      setTimeout(() => {
        if (confetti.parentNode) {
          container.removeChild(confetti)
        }
      }, 500)
    }
  }

  const handleSongUpload = (e) => {
    const files = e.target.files
    if (!files.length) return

    setIsSongUploading(true)
    
    setTimeout(() => {
      const newSongs = [...songs]
      
      for (let i = 0; i < files.length; i++) {
        let fileName = files[i].name
        if (fileName.lastIndexOf('.') !== -1) {
          fileName = fileName.substring(0, fileName.lastIndexOf('.'))
        }
        newSongs.push(fileName)
      }
      
      setSongs(newSongs)
      setIsSongUploading(false)
    }, 1000)
  }

  const handlePhotoUpload = (e) => {
    const files = e.target.files
    if (!files.length) return

    setIsPhotoUploading(true)
    
    setTimeout(() => {
      const newPhotos = [...photos]
      
      for (let i = 0; i < files.length; i++) {
        newPhotos.push({
          id: `photo-${Date.now()}-${i}`,
          name: files[i].name,
          url: URL.createObjectURL(files[i]),
        })
      }
      
      setPhotos(newPhotos)
      setIsPhotoUploading(false)
    }, 1500)
  }

  const handleAddSongs = (e) => {
    e.preventDefault()
    songFileInputRef.current.click()
  }

  const handleAddPhotos = (e) => {
    e.preventDefault()
    photoFileInputRef.current.click()
  }

  const handleSendGift = () => {
    alert(`Thank you for your virtual gift of ${giftAmount}! 🎁`)
    setGiftAmount(10) // Reset to default
  }

  const startGame = () => {
    setGameScore(0)
    setGameStarted(true)
    setActiveFeature('game')
  }

  const handleQuizAnswer = (questionId, answer) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const quizQuestions = [
    {
      id: 1,
      question: "Better birthday cake flavor?",
      options: ["Chocolate", "Vanilla"]
    },
    {
      id: 2,
      question: "Better party activity?",
      options: ["Dancing", "Games"]
    },
    {
      id: 3,
      question: "Better birthday drink?",
      options: ["Cocktails", "Mocktails"]
    }
  ]

  return (
    <div
      ref={confettiRef}
      className='w-screen p-4 md:p-8 flex justify-center relative'
      onMouseMove={handleMouseMove}
    >
      <main className='w-full md:w-[820px] bg-stone-800 pixel-border flex flex-col items-center'>
        <div className='bg-[#d6dd70] stripes w-full h-auto md:h-40 flex flex-col md:flex-row justify-between items-center p-4 md:p-0'>
          <div className="flex justify-center">
            <Image src='/girl.png' width={120} height={120} alt='Girl' />
          </div>
          <div className='p-3 text-center md:text-left'>
            <span className={`${Honk.className} text-xl md:text-2xl`}>
              You're invited to:
            </span>
            <h1
              className={`${ClimateCrisis.className} text-pink-400 uppercase text-3xl md:text-4xl pixel-text`}
            >
              Pooja's
            </h1>
            <h2
              className={`${ClimateCrisis.className} uppercase text-xl md:text-2xl pixel-text`}
            >
              Birthday Eve
            </h2>
          </div>
          <div className="flex justify-center">
            <Image
              src='/party.gif'
              width={120}
              height={120}
              alt='Party'
              className='m-3'
            />
          </div>
        </div>

        {/* Feature Navigation */}
        <div className='w-full bg-purple-600 pixel-border flex flex-wrap justify-center gap-2 p-2'>
          <button 
            onClick={() => setActiveFeature(activeFeature === 'countdown' ? null : 'countdown')}
            className={`${Honk.className} text-lg px-3 py-1 ${activeFeature === 'countdown' ? 'bg-yellow-400' : 'bg-blue-400'} pixel-border`}
          >
            Countdown
          </button>
        
          <button 
            onClick={() => setActiveFeature(activeFeature === 'gift' ? null : 'gift')}
            className={`${Honk.className} text-lg px-3 py-1 ${activeFeature === 'gift' ? 'bg-yellow-400' : 'bg-blue-400'} pixel-border`}
          >
            Send Gift
          </button>
          <button 
            onClick={() => setActiveFeature(activeFeature === 'quiz' ? null : 'quiz')}
            className={`${Honk.className} text-lg px-3 py-1 ${activeFeature === 'quiz' ? 'bg-yellow-400' : 'bg-blue-400'} pixel-border`}
          >
            Birthday Quiz
          </button>
          <button 
            onClick={() => setActiveFeature(activeFeature === 'soundtrack' ? null : 'soundtrack')}
            className={`${Honk.className} text-lg px-3 py-1 ${activeFeature === 'soundtrack' ? 'bg-yellow-400' : 'bg-blue-400'} pixel-border`}
          >
            Soundtrack
          </button>
          {/* <button 
            onClick={() => setActiveFeature(activeFeature === 'cake' ? null : 'cake')}
            className={`${Honk.className} text-lg px-3 py-1 ${activeFeature === 'cake' ? 'bg-yellow-400' : 'bg-blue-400'} pixel-border`}
          >
            Virtual Cake
          </button> */}
          <button 
            onClick={startGame}
            className={`${Honk.className} text-lg px-3 py-1 ${activeFeature === 'game' ? 'bg-yellow-400' : 'bg-blue-400'} pixel-border`}
          >
            Mini Game
          </button>
        </div>

        {/* Active Feature Display */}
        {activeFeature === 'countdown' && (
  <div className='w-full bg-pink-200 pixel-border p-4 flex flex-col items-center'>
    <h3 className={`${ClimateCrisis.className} text-2xl uppercase text-teal-600 text-center`}>
      Countdown to Party!
    </h3>
    <div className='flex gap-4 mt-2'>
      <div className='text-center'>
        <div className={`${Micro5.className} text-4xl text-teal-600`}>
          {timeLeft.days}
        </div>
        <div className={`${ComicNeue.className} text-teal-600`}>
          Days
        </div>
      </div>
      <div className='text-center'>
        <div className={`${Micro5.className} text-4xl text-teal-600`}>
          {timeLeft.hours}
        </div>
        <div className={`${ComicNeue.className} text-teal-600`}>
          Hours
        </div>
      </div>
      <div className='text-center'>
        <div className={`${Micro5.className} text-4xl text-teal-600`}>
          {timeLeft.minutes}
        </div>
        <div className={`${ComicNeue.className} text-teal-600`}>
          Minutes
        </div>
      </div>
      <div className='text-center'>
        <div className={`${Micro5.className} text-4xl text-teal-600`}>
          {timeLeft.seconds}
        </div>
        <div className={`${ComicNeue.className} text-teal-600`}>
          Seconds
        </div>
      </div>
    </div>
    {/* <Image src='/countdown.gif' width={100} height={100} alt='Countdown' className='mt-2' /> */}
  </div>
)}

        {activeFeature === 'gift' && (
          <div className='w-full bg-yellow-200 pixel-border p-4 flex flex-col items-center'>
            <h3 className={`${ClimateCrisis.className} text-2xl uppercase text-orange-600 text-center`}>
  Send a Virtual Gift
</h3>
<Image src='/gift.png' width={80} height={80} alt='Gift' className='my-2' />
<div className={`${ComicNeue.className} text-center mb-2 text-orange-600 font-bold`}>
  Select an amount to gift Pooja for her birthday!
</div>



            <div className='flex gap-2 mb-3'>
              {[5, 10, 20, 50].map(amount => (
                <button 
                  key={amount}
                  onClick={() => setGiftAmount(amount)}
                  className={`${Honk.className} text-lg px-3 py-1 ${giftAmount === amount ? 'bg-green-400' : 'bg-blue-400'} pixel-border`}
                >
                  {amount}
                </button>
              ))}
            </div>
            <input 
              type="range" 
              min="1" 
              max="100" 
              value={giftAmount}
              onChange={(e) => setGiftAmount(parseInt(e.target.value))}
              className='w-full max-w-xs mb-3'
            />
            <button 
              onClick={handleSendGift}
              className={`${Honk.className} text-xl px-4 py-2 bg-pink-400 pixel-border hover:bg-pink-500`}
            >
              Send Rs.{giftAmount} Gift 🎁
            </button>
          </div>
        )}

        {activeFeature === 'quiz' && (
          <div className='w-full bg-blue-200 pixel-border p-4'>
           <h3 className={`${ClimateCrisis.className} text-2xl uppercase text-pink-500 text-center`}>
  Birthday This or That
</h3>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-3'>
              {quizQuestions.map(q => (
                <div key={q.id} className='bg-white pixel-border p-3'>
                 <h4 className={`${ComicNeue.className} font-bold text-center mb-2 text-blue-600 bg-white p-2`}>
  {q.question}
</h4>

                  <div className='flex flex-col gap-2'>
                    {q.options.map(option => (
                      <button
                        key={option}
                        onClick={() => handleQuizAnswer(q.id, option)}
                        className={`${Honk.className} text-lg px-2 py-1 ${quizAnswers[q.id] === option ? 'bg-green-400' : 'bg-blue-400'} pixel-border`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {Object.keys(quizAnswers).length > 0 && (
             <div className={`${ComicNeue.className} text-center mt-3 font-bold text-red-600`}>
             Thanks for playing! {Object.keys(quizAnswers).length}/3 answered
           </div>
           
           
            )}
          </div>
        )}

        {activeFeature === 'soundtrack' && (
          <div className='w-full bg-green-200 pixel-border p-4'>
            <h3 className={`${ClimateCrisis.className} text-2xl uppercase text-center text-purple-600 bg-green-200 p-2 rounded`}>
  Birthday Soundtrack
</h3>
            <div className='flex justify-center my-3'>
              {/* <Image src='/music.gif' width={100} height={100} alt='Music' /> */}
            </div>
            <div className='bg-white pixel-border p-3'>
              <div className='h-[200px] overflow-y-auto old-scrollbar'>
                {songs.map((song, index) => (
                  <div key={index} className='flex items-center gap-2 mb-2'>
                    <span className={`${Micro5.className} text-xl`}>🎵</span>
                    <span className={`${ComicNeue.className} flex-grow text-purple-600 bg-green-200 p-2 rounded`}>
  {song}
</span>

                    <button className={`${Honk.className} text-sm bg-blue-400 pixel-border px-2`}>
                      Play
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={handleAddSongs}
                className={`${Honk.className} text-lg mt-2 w-full bg-pink-400 pixel-border py-1`}
              >
                {isSongUploading ? 'Uploading...' : 'Add More Songs'}
              </button>
            </div>
            <input 
              type="file" 
              ref={songFileInputRef}
              onChange={handleSongUpload}
              className="hidden"
              accept="audio/*"
              multiple
            />
          </div>
        )}

        {activeFeature === 'cake' && (
          <div className='w-full bg-red-200 pixel-border p-4 flex flex-col items-center'>
            <h3 className={`${ClimateCrisis.className} text-2xl uppercase`}>Virtual Birthday Cake</h3>
            <canvas 
              ref={cakeCanvasRef} 
              width={300} 
              height={200}
              className='border-4 border-white bg-pink-100 my-3'
            />
            <div className={`${ComicNeue.className} text-center`}>
              {cakeCandlesLit 
                ? 'Make a wish before the candles go out!' 
                : 'Click on the candles to light them!'}
            </div>
          </div>
        )}

        {activeFeature === 'game' && (
          <div className='w-full bg-orange-200 pixel-border p-4 flex flex-col items-center'>
            <h3 className={`${ClimateCrisis.className} text-2xl uppercase text-blue-600 bg-peach-200 p-2 rounded text-center`}>
  Present Catcher Game
</h3>
<div className={`${ComicNeue.className} text-center mb-2 text-blue-600 bg-peach-200 p-4 rounded`}>
  Use arrow keys to move. Catch presents (5pts), avoid bombs (-10pts)!
</div>

            <canvas 
              ref={gameCanvasRef} 
              width={300} 
              height={400}
              className='border-4 border-white bg-white my-2'
            />
            {!gameStarted ? (
              <button 
                onClick={startGame}
                className={`${Honk.className} text-xl px-4 py-2 bg-green-400 pixel-border mt-2`}
              >
                Start Game
              </button>
            ) : (
              <div className={`${Micro5.className} text-3xl mt-2`}>Score: {gameScore}</div>
            )}
          </div>
        )}

        <div className='grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-3 p-3'>
          {/* Party Smart Box */}
          <div className='bg-[#BC912C] relative p-5 pixel-border flex flex-col justify-center items-center'>
            <Image
              src='/capsules.png'
              className='absolute top-0 z-0'
              alt='Capsule'
              width={80}
              height={80}
            />
            <h3
              className={`${ClimateCrisis.className} z-10 text-center uppercase text-lg md:text-xl pixel-text`}
            >
              Party Smart
            </h3>
            <div className='bg-stone-400 z-10 pixel-border px-3 py-1 mt-5 text-center leading-4'>
              <span
                className={`${Micro5.className} text-black text-center text-base md:text-xl uppercase`}
              >
                We've got you covered!
              </span>
            </div>
          </div>

          {/* Homecooked Section */}
          <div className='pixel-border bg-red-500 p-5 flex flex-col items-center justify-between'>
            <h2
              className={`${ClimateCrisis.className} uppercase text-2xl md:text-3xl pixel-text`}
            >
              Homecooked
            </h2>
            <div className='flex justify-between gap-2 md:gap-3'>
              <div className='rounded-md bg-gradient-to-br from-yellow-100 to-yellow-400 border-yellow-600 border-4 drop-shadow-md p-1'>
                <Image
                  src='/pizza.png'
                  alt='Pizza'
                  width={80}
                  height={80}
                />
              </div>
              <div className='rounded-md bg-gradient-to-br from-violet-100 to-violet-400 border-violet-600 border-4 drop-shadow-md p-1'>
                <Image
                  src='/ravioli.png'
                  alt='Ravioli'
                  width={80}
                  height={80}
                />
              </div>
              <div className='rounded-md bg-gradient-to-br from-sky-100 to-sky-400 border-sky-600 border-4 drop-shadow-md p-1'>
                <Image
                  src='/noodles.png'
                  alt='Noodles'
                  width={80}
                  height={80}
                />
              </div>
            </div>
          </div>

          {/* Cake Section */}
          <div className='relative flex justify-center items-center'>
            <Image
              src='/cake.png'
              width={150}
              height={150}
              alt='Cake'
              className='w-fit'
            />
            <div
              className={`pixel-border absolute left-0 bottom-0 leading-4 bg-stone-400 w-full md:w-1/2 ${Micro5.className} uppercase p-3 md:p-5 text-black text-base md:text-xl text-center md:text-left`}
            >
              Strawberry Vanilla Cake
            </div>
          </div>

          {/* Sun/Cloud Time Section */}
          <div className='p-2 pixel-border relative bg-gradient-to-b from-blue-500 to-sky-400 flex flex-col justify-center items-center'>
            <Image
              src='/sun.png'
              alt='Sun'
              width={60}
              height={60}
              className='absolute right-8 top-2 z-0'
            />
            <Image
              src='/cloud.png'
              alt='Cloud'
              width={80}
              height={80}
              className='absolute left-5 top-5 z-0'
            />
            <Image
              src='/cloud.png'
              alt='Cloud'
              width={100}
              height={100}
              className='absolute right-3 top-8 z-0'
            />
            <div className='bg-white pixel-border z-10 flex flex-col justify-center items-center p-2 md:p-3'>
              <h2
                className={`${ClimateCrisis.className} text-sky-200 uppercase text-lg md:text-2xl pixel-text`}
              >
                7 May
              </h2>
              <span className={`${Honk.className} text-lg md:text-2xl`}>7 PM</span>
            </div>
            <Image
              src='/building.png'
              alt='Building'
              width={120}
              height={120}
              className='h-48 w-auto md:w-full md:absolute bottom-0 z-0'
            />
          </div>

          {/* Drinking Games + Wifi/RSVP */}
          <div className='flex flex-col gap-3'>
            <div className='pixel-border h-full p-5 bg-cyan-300 flex flex-col md:flex-row justify-between items-center gap-2'>
              <div className='bg-white pixel-border'>
                <Image
                  src='/cards.png'
                  alt='Cards'
                  width={80}
                  height={80}
                />
              </div>
              <div>
                <h3
                  className={`${Nabla.className} text-center uppercase text-2xl md:text-3xl pixel-text`}
                >
                  Drinking Games
                </h3>
              </div>
              <div className='bg-white pixel-border'>
                <Image src='/cups.png' alt='Cups' width={80} height={80} />
              </div>
            </div>
            <div className='flex flex-col md:flex-row gap-3 justify-between h-full'>
              <div className='pixel-border bg-orange-500 p-5 w-full h-full flex flex-col justify-center items-center'>
                <span
                  className={`${ClimateCrisis.className} text-white text-lg md:text-xl`}
                >
                  Join Wifi
                </span>
                <span className={`${ComicNeue.className} font-bold`}>
                  username
                </span>
                <span className={`${ComicNeue.className} font-bold`}>
                  password
                </span>
              </div>
              <div className='pixel-border bg-emerald-500 p-5 w-full h-full flex justify-center items-center'>
  <a href="https://google.com" target="_blank" rel="noopener noreferrer">
    <Image
      src='/rsvp.gif'
      width={120}
      height={120}
      alt='RSVP'
      className='bounce cursor-pointer'
    />
  </a>
</div>

            </div>
          </div>

          {/* Playlist Section */}
          <div className='bg-yellow-200 pixel-border p-2'>
            <div className='bg-yellow-400 pixel-border p-2 flex flex-col justify-center items-center'>
              <h3
                className={`${ClimateCrisis.className} uppercase text-2xl md:text-3xl pixel-text`}
              >
                Playlist
              </h3>
              <span
                className={`${ComicNeue.className} text-black text-center font-bold text-xs md:text-sm`}
              >
                Add your favourite party songs!
              </span>
              <div className='h-[200px] overflow-y-scroll flex flex-col gap-2 old-scrollbar p-2 w-full'>
                {songs.map((song, index) => (
                  <div
                    key={index}
                    className='bg-stone-400 pixel-border px-3 py-1'
                  >
                    <span className={`${Micro5.className} text-black text-base md:text-xl`}>
                      {song}
                    </span>
                  </div>
                ))}
              </div>
              
              <input 
                type="file" 
                ref={songFileInputRef}
                onChange={handleSongUpload}
                className="hidden"
                accept="audio/*"
                multiple
              />
              
              <button
                onClick={handleAddSongs}
                className={`text-blue-500 ${ComicNeue.className} font-bold text-lg underline mt-2 flex items-center`}
                disabled={isSongUploading}
              >
                {isSongUploading ? (
                  <span className="text-gray-500">Uploading...</span>
                ) : (
                  <span>Add Songs</span>
                )}
              </button>
            </div>
          </div>

          {/* See you soon GIF */}
          <div className='flex flex-col items-center w-full'>
            <h3
              className={`${ClimateCrisis.className} text-center uppercase text-fuchsia-300 p-2 md:p-5 text-2xl md:text-3xl pixel-text`}
            >
              See you soon!
            </h3>

            <div className='relative w-full flex justify-center items-center'>
              <Image
                alt='friends'
                src='/see-you-soon.gif'
                width={300}
                height={200}
                className='object-contain'
              />
            </div>
          </div>

          {/* Coming Soon / Photo Gallery */}
          <div className='pixel-border bg-stone-600 h-full flex flex-col justify-center items-center p-3'>
            <h3
              className={`${ClimateCrisis.className} text-center uppercase text-stone-400 p-3 text-2xl md:text-3xl pixel-text`}
            >
              {photos.length > 0 ? "Party Photos" : "Coming Soon..."}
            </h3>
            
            {photos.length > 0 && (
              <div className='grid grid-cols-2 gap-2 w-full mt-2 max-h-64 overflow-y-auto old-scrollbar p-2'>
                {photos.map((photo) => (
                  <div key={photo.id} className='pixel-border bg-stone-400 p-1'>
                    <Image 
                      src={photo.url} 
                      alt={photo.name}
                      width={140}
                      height={100}
                      className='w-full object-cover'
                    />
                    <div className='text-xs text-center mt-1 truncate'>
                      {photo.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Photos Upload Section */}
          <div className='pixel-border p-5 bg-pink-300 h-full flex flex-col justify-center items-center'>
            <h3
              className={`${Nabla.className} uppercase text-lime-500 text-2xl md:text-3xl pixel-text`}
            >
              Photos
            </h3>
            <Image
              src='/drive.png'
              width={80}
              height={80}
              alt='Drive'
              className='w-20 md:w-24'
            />
            <div
              className={`pixel-border leading-4 bg-stone-400 ${Micro5.className} uppercase p-3 text-black text-base md:text-xl text-center`}
            >
              You can find all your photos on this drive! If you have more, please add them here
            </div>
            
            <input 
              type="file" 
              ref={photoFileInputRef}
              onChange={handlePhotoUpload}
              className="hidden"
              accept="image/*"
              multiple
            />
            
            <button 
              onClick={handleAddPhotos}
              className='bg-gradient-to-b from-blue-300 to-blue-600 hover:from-blue-400 hover:to-blue-700 pixel-border rounded-full px-3 py-1 mt-5'
              disabled={isPhotoUploading}
            >
              <span className={`${Honk.className} text-black text-lg md:text-xl`}>
                {isPhotoUploading ? "Uploading..." : "Add Photos"}
              </span>
            </button>
          </div>
        </div>
        
        <div>
          <h2 className={`${ClimateCrisis.className} text-red-200 uppercase text-lg md:text-2xl pixel-text text-center mx-auto`}>
            Developed by Jeetandar & Pooja
          </h2>
        </div>
      </main>
    </div>
  )
}