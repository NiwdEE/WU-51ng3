import { useEffect, useState } from 'react'

export function ChristmasDecorations() {
  const [snowflakes, setSnowflakes] = useState([])

  useEffect(() => {
    const flakes = []
    for (let i = 0; i < 50; i++) {
      flakes.push({
        id: i,
        left: Math.random() * 100,
        animationDuration: 5 + Math.random() * 10,
        animationDelay: Math.random() * 5,
        fontSize: 0.5 + Math.random() * 1,
      })
    }
    setSnowflakes(flakes)
  }, [])

  return (
    <>
      {/* Snowflakes */}
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="snowflake"
          style={{
            left: `${flake.left}%`,
            animationDuration: `${flake.animationDuration}s`,
            animationDelay: `${flake.animationDelay}s`,
            fontSize: `${flake.fontSize}em`,
          }}
        >
          ❄
        </div>
      ))}

      {/* Garland with lights */}
      <div className="garland">
        <div className="garland-string" />
        {[...Array(20)].map((_, i) => {
          const colors = ['#ff0000', '#00ff00', '#ffff00', '#0000ff', '#ff00ff', '#00ffff']
          const color = colors[i % colors.length]
          return (
            <div
              key={i}
              className="garland-light"
              style={{
                left: `${(i * 5) + 2.5}%`,
                backgroundColor: color,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          )
        })}
      </div>
    </>
  )
}
