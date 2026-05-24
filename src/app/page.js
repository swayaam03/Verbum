import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      
      <main>
        {/* Tagline Hero */}
        <section className="tagline-hero container" style={{ opacity: 1, transform: "translateY(0)" }}>
          <h2 className="tagline">Where words find meaning.</h2>
        </section>

        {/* Featured Article Card */}
        <section className="featured-articles section-padded" style={{ opacity: 1, transform: "translateY(0)" }}>
          <div className="container">
            <Link href="/articles" style={{ textDecoration: "none" }}>
              <div className="article-card">
                <h2>The Quiet Power of Thoughtful Expression</h2>
                <p>
                  In a world of constant noise, Verbum invites you to slow down and rediscover the profound impact of words. Our platform is a sanctuary for authentic voices, where every sentence is crafted with intention and every story finds its resonance.
                </p>
              </div>
            </Link>
          </div>
        </section>

        {/* Image & Text Section */}
        <section className="image-text-section section-padded" style={{ opacity: 1, transform: "translateY(0)" }}>
          <div className="container layout-two-column">
            <div className="image-placeholder" style={{ backgroundColor: "#E8E4DF", display: "flex", flexDirection: "column", gap: "10px" }}>
              <span style={{ fontSize: "3em", opacity: 0.7 }}>✍️</span>
              <p style={{ margin: 0, fontStyle: "italic", opacity: 0.8 }}>A Canvas for Your Inner World</p>
            </div>
            <div className="text-content">
              <h3>A Canvas for Your Inner World</h3>
              <p>
                Verbum offers a beautifully uncluttered environment, allowing your ideas to flow freely onto the page. With intuitive tools and a focus on simplicity, you can immerse yourself fully in the creative process, from the initial spark to the final masterpiece.
              </p>
            </div>
          </div>
        </section>

        {/* Value Proposition */}
        <section className="value-proposition section-padded text-center-content" style={{ opacity: 1, transform: "translateY(0)" }}>
          <div className="container">
            <h3>Cultivating Connection Through Story</h3>
            <p>
              Beyond individual expression, Verbum fosters a vibrant community of writers and readers. Share your insights, engage in meaningful discussions, and find inspiration in the shared journey of bringing words to life. It's a space where every voice is valued.
            </p>
          </div>
        </section>

        {/* Reversed Image & Text Section */}
        <section className="image-text-section reverse-layout section-padded" style={{ opacity: 1, transform: "translateY(0)" }}>
          <div className="container layout-two-column">
            <div className="image-placeholder" style={{ backgroundColor: "#EBE5DF", display: "flex", flexDirection: "column", gap: "10px" }}>
              <span style={{ fontSize: "3em", opacity: 0.7 }}>📖</span>
              <p style={{ margin: 0, fontStyle: "italic", opacity: 0.8 }}>Refine Your Voice, Elevate Your Craft</p>
            </div>
            <div className="text-content">
              <h3>Refine Your Voice, Elevate Your Craft</h3>
              <p>
                Our resources and community support you at every stage. From prompts that spark imagination to gentle feedback that refines your prose, Verbum is dedicated to helping you evolve as a writer and share your most impactful stories with the world.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="call-to-action section-padded text-center-content" style={{ opacity: 1, transform: "translateY(0)" }}>
          <div className="container">
            <h3>Ready to Share Your Story?</h3>
            <Link href="/signup" className="button">
              Begin Your Journey
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
