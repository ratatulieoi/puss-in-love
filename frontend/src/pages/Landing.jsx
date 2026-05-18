import { Link } from 'react-router-dom';

function Landing() {
    return (
        <main className="landing-page">
            <section className="stitch-hero" id="top">
                <img className="stitch-hero__image" src="/landing/pink-valley.jpg" alt="Painterly fantasy landscape" />
                <div className="stitch-hero__shade" />
                <div className="stitch-hero__content">
                    <h1>Puss In Love</h1>
                    <p className="stitch-hero__slogan">
                        <span className="slogan-line">Because every cat deserves a chance</span>
                        <span className="slogan-line slogan-line--rotating">
                            <span>to meet</span>
                            <span className="rotating-words" aria-label="a sweet match">
                                <span>a sweet match.</span>
                                <span>someone gentle.</span>
                                <span>a little love.</span>
                                <span>a purrfect partner.</span>
                                <span>a cuddle buddy.</span>
                                <span>a tiny romance.</span>
                                <span>a soft friend.</span>
                                <span>a lovely hello.</span>
                                <span>a new favorite.</span>
                                <span>a purring heart.</span>
                            </span>
                        </span>
                    </p>
                    <div className="stitch-actions">
                        <Link className="stitch-btn stitch-btn--primary" to="/register">Register</Link>
                        <Link className="stitch-btn stitch-btn--ghost" to="/login">Login</Link>
                    </div>
                </div>
            </section>

            <section className="stitch-how" id="how-it-works">
                <div className="stitch-step stitch-step--left">
                    <div className="stitch-step__media stitch-step__media--round">
                        <img src="/landing/ship-shark.jpg" alt="Cat profile illustration" />
                    </div>
                    <div className="stitch-step__copy">
                        <span>01</span>
                        <h2>Create Profile</h2>
                        <p>Add your cat's details, photos, breed, color, and vaccination records.</p>
                    </div>
                </div>

                <div className="stitch-step stitch-step--right">
                    <div className="stitch-step__media stitch-step__media--tilt">
                        <img src="/landing/hero-cat.jpg" alt="Swipe cats illustration" />
                    </div>
                    <div className="stitch-step__copy stitch-step__copy--right">
                        <span>02</span>
                        <h2>Swipe Cats</h2>
                        <p>Like or pass on other cats from your selected cat profile.</p>
                    </div>
                </div>

                <div className="stitch-step stitch-step--left">
                    <div className="stitch-step__media stitch-step__media--wide">
                        <img src="/landing/match-chat.jpg" alt="Match and chat illustration" />
                    </div>
                    <div className="stitch-step__copy">
                        <span>03</span>
                        <h2>Match & Chat</h2>
                        <p>When both cats like each other, owners can start chatting.</p>
                    </div>
                </div>
            </section>

            <section className="stitch-features" id="features">
                <div className="stitch-features__backdrop" />
                <h2>Core Features</h2>
                <div className="stitch-feature-list">
                    <article>
                        <span>01</span>
                        <h3>Cat Management</h3>
                        <p>Add, edit, upload photos, and organize every cat you own in one place.</p>
                    </article>
                    <article>
                        <span>02</span>
                        <h3>Health Records</h3>
                        <p>Track vaccination history and certificates for safer, more responsible matching.</p>
                    </article>
                    <article>
                        <span>03</span>
                        <h3>Filtered Browsing</h3>
                        <p>Search cats by name, breed, gender, and owner location before swiping.</p>
                    </article>
                    <article>
                        <span>04</span>
                        <h3>Swipe Matching</h3>
                        <p>Swipe as one of your cats, then continue to matches and chat when both sides like.</p>
                    </article>
                </div>
            </section>

            <section className="stitch-editorial" id="why">
                <div className="stitch-editorial__copy">
                    <h2>Your cat deserves more than a random stray.</h2>
                    <div className="stitch-line" />
                    <blockquote>Find a match with a profile, a story, and a caring owner behind it.</blockquote>
                    <p>Puss In Love helps owners create cat profiles, discover other cats, match through mutual likes, and start a simple chat when both sides are interested.</p>
                </div>
                <div className="stitch-editorial__image">
                    <img src="/landing/why-cat-cropped.jpg" alt="Painterly cat reference" />
                </div>
            </section>

            <section className="stitch-final">
                <img className="stitch-final__background" src="/landing/final-cta-bg.jpg" alt="Painterly flower field" />
                <div className="stitch-final__box">
                    <h2>Ready to find a better match for your cat?</h2>
                    <Link className="stitch-btn stitch-btn--primary stitch-btn--lovely" to="/register">Start Now</Link>
                </div>
            </section>

            <footer className="stitch-footer">
                <div>PUSS IN LOVE</div>
                <nav aria-label="Footer navigation">
                    <Link to="/login">Login</Link>
                    <Link to="/register">Register</Link>
                    <a href="#features">Features</a>
                    <a href="https://github.com/ratatulieoi/puss-in-love" target="_blank" rel="noreferrer">Project</a>
                </nav>
                <p>PUSS IN LOVE. CAT MATCHING PLATFORM.</p>
            </footer>
        </main>
    );
}

export default Landing;
