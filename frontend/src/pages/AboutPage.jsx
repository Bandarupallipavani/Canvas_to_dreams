import { Link } from 'react-router-dom'
import { Instagram, Youtube, Palette, Heart, Star } from 'lucide-react'

const INSTA_URL = 'https://www.instagram.com/canvas_into_dreams?utm_source=qr&igsh=bTc3emRmZ2ZmZXQ4'
const YT_URL    = 'https://youtube.com/@artbook2004?si=DJ8Fd0aWQ7EX5xYJ'

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="w-20 h-20 bg-canvas-gradient rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Palette className="w-10 h-10 text-canvas-700" />
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-ink mb-4">
          The Story Behind <span className="text-canvas-600 italic">Canvas to Dreams</span>
        </h1>
        <p className="text-ink-muted text-lg max-w-2xl mx-auto leading-relaxed">
          Every painting begins as a blank canvas and ends as a living dream. 
          Welcome to my world of colour, emotion, and original art.
        </p>
      </div>

      {/* Story */}
      <div className="grid md:grid-cols-2 gap-12 mb-16 items-center">
        <div className="bg-canvas-gradient rounded-3xl aspect-square flex items-center justify-center">
          <span className="text-9xl">🎨</span>
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold text-ink mb-4">Hello, I'm the artist</h2>
          <div className="space-y-4 text-ink-muted leading-relaxed">
            <p>
              Art has always been my way of speaking when words fall short. 
              I started <strong className="text-ink">Canvas to Dreams</strong> to share that 
              language with the world — one original painting at a time.
            </p>
            <p>
              Every piece I create is hand-painted with genuine passion. No prints, 
              no reproductions — just original, soulful artwork that carries a piece of me into your home.
            </p>
            <p>
              I believe art should be accessible, emotional, and alive. 
              That's why I also share my process on Instagram and YouTube — 
              so you can watch each dream take shape on canvas.
            </p>
          </div>
          <div className="flex gap-3 mt-6 flex-wrap">
            <a href={INSTA_URL} target="_blank" rel="noopener noreferrer"
              className="btn-outline flex items-center gap-2 text-sm py-2 px-4">
              <Instagram className="w-4 h-4" /> @canvas_to_dreams
            </a>
            <a href={YT_URL} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
              <Youtube className="w-4 h-4" /> YouTube Channel
            </a>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {[
          { icon: Palette, title: '100% Original', desc: 'Every painting is one of a kind. No prints, no copies — only real, handcrafted art.' },
          { icon: Heart,   title: 'Painted with Love', desc: 'Each piece carries genuine emotion. Art is not just made here, it is felt.' },
          { icon: Star,    title: 'Quality First', desc: 'Premium materials, careful packing, and a commitment to delivering art that lasts.' },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card p-6 text-center">
            <div className="w-12 h-12 bg-canvas-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Icon className="w-6 h-6 text-canvas-600" />
            </div>
            <h3 className="font-display font-bold text-ink mb-2">{title}</h3>
            <p className="text-sm text-ink-muted leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center bg-ink text-parchment rounded-3xl p-12">
        <h2 className="font-display text-3xl font-bold mb-3">Ready to Own a Dream?</h2>
        <p className="text-canvas-200 mb-8 max-w-md mx-auto">
          Browse the gallery and find the painting that speaks to your soul.
        </p>
        <Link to="/shop" className="btn-primary text-base inline-flex items-center gap-2">
          <Palette className="w-5 h-5" /> Explore the Gallery
        </Link>
      </div>
    </div>
  )
}
