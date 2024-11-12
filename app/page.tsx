'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './page.module.css';

const vocabulary = [
  { word: 'Happy', definition: 'Feeling or showing pleasure and contentment' },
  { word: 'Big', definition: 'Of considerable size or extent' },
  { word: 'Fast', definition: 'Moving or capable of moving at high speed' },
  { word: 'Quiet', definition: 'Making little or no noise' },
  { word: 'Bright', definition: 'Giving out or reflecting much light' },
  { word: 'Cold', definition: 'Of or at a low temperature' },
  { word: 'Soft', definition: 'Easy to mold, cut, or compress' },
  { word: 'Sweet', definition: 'Having a taste like sugar' }
];

const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6', '#E74C3C'];

class Balloon {
  x: number;
  y: number;
  word: string;
  color: string;
  radius: number;
  speed: number;
  popped: boolean;

  constructor(x: number, y: number, word: string, color: string) {
    this.x = x;
    this.y = y;
    this.word = word;
    this.color = color;
    this.radius = 40;
    this.speed = Math.random() * 0.5 + 0.5;
    this.popped = false;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.popped) return;

    // Draw balloon
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Draw string
    ctx.beginPath();
    ctx.moveTo(this.x, this.y + this.radius);
    ctx.lineTo(this.x, this.y + this.radius + 20);
    ctx.stroke();

    // Draw word
    ctx.fillStyle = 'black';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(this.word, this.x, this.y);
  }

  update(canvasHeight: number) {
    if (!this.popped) {
      this.y -= this.speed;
      if (this.y < -this.radius) {
        this.y = canvasHeight + this.radius;
      }
    }
  }

  isClicked(mouseX: number, mouseY: number) {
    const distance = Math.sqrt(
      Math.pow(mouseX - this.x, 2) + Math.pow(mouseY - this.y, 2)
    );
    return distance < this.radius;
  }
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [currentWord, setCurrentWord] = useState(vocabulary[0]);
  const [balloons, setBalloons] = useState<Balloon[]>([]);

  const initGame = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    const newBalloons = vocabulary.map((item, index) => {
      return new Balloon(
        Math.random() * (canvas.width - 80) + 40,
        Math.random() * canvas.height + canvas.height,
        item.word,
        colors[index % colors.length]
      );
    });

    setBalloons(newBalloons);
    selectNewWord(newBalloons);
  };

  const selectNewWord = (currentBalloons: Balloon[]) => {
    const availableWords = vocabulary.filter(item =>
      currentBalloons.some(balloon =>
        balloon.word === item.word && !balloon.popped
      )
    );

    if (availableWords.length === 0) {
      alert(`Game Over! Final Score: ${score}`);
      initGame();
      setScore(0);
      return;
    }

    const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    setCurrentWord(randomWord);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const newBalloons = [...balloons];
    let scoreChanged = false;

    newBalloons.forEach(balloon => {
      if (!balloon.popped && balloon.isClicked(mouseX, mouseY)) {
        if (balloon.word === currentWord.word) {
          balloon.popped = true;
          setScore(prev => prev + 10);
          scoreChanged = true;
          selectNewWord(newBalloons);
        } else {
          setScore(prev => Math.max(0, prev - 5));
          scoreChanged = true;
        }
      }
    });

    if (scoreChanged) {
      setBalloons(newBalloons);
    }
  };

  useEffect(() => {
    initGame();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const gameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      balloons.forEach(balloon => {
        balloon.update(canvas.height);
        balloon.draw(ctx);
      });
      
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [balloons]);

  return (
    <main className={styles.main}>
      <div className={styles.gameContainer}>
        <div className={styles.score}>Score: {score}</div>
        <div className={styles.definition}>
          Find the word that means: <span>{currentWord.definition}</span>
        </div>
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          onClick={handleCanvasClick}
          className={styles.canvas}
        />
      </div>
    </main>
  );
}