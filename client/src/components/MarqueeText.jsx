import '../style.css';

function MarqueeText() {
  return (
    <div className="marquee-container">
      <div className="marquee-content">
        {Array(2).fill(0).map((_, idx) => (
          <div key={idx} className="marquee-group">
            {Array(10)
              .fill(0)
              .map((_, i) => (
                <span key={i} className="mx-2 inline-flex items-center">
                  <span className="text-yellow-300 mx-1">👀</span> Peeking into the Heart <span className="text-yellow-300 mx-1">👀</span>
                </span>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default MarqueeText;