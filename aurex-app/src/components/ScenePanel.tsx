import { useCanvas } from '../CanvasContext';

function formatDuration(ms: number) {
  if (!ms) return '0s';
  const s = Math.round(ms / 1000);
  if (s >= 60) { const m = Math.floor(s / 60); return `${m}m ${s % 60}s`; }
  return `${s}s`;
}

export default function ScenePanel() {
  const { slides, currentIndex, switchScene, deleteScene, addScene, refreshSceneList } = useCanvas();

  return (
    <div id="scenePanel">
      <div className="panel-title">Scenes</div>
      <button id="addSceneBtn" onClick={addScene}>
        <svg viewBox="0 0 14 14" width="14" height="14"><line x1="7" y1="2" x2="7" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><line x1="2" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
        Add Scene
      </button>
      <div id="sceneList">
        {slides.map((slide, i) => (
          <div key={i} className={'scene-item' + (i === currentIndex ? ' active' : '')} onClick={() => switchScene(i)}>
            <span className="idx">{i + 1}</span>
            <div className="info">
              <div className="name"
                onDoubleClick={(e) => {
                  const el = e.currentTarget;
                  if (el.querySelector('input')) return;
                  const inp = document.createElement('input');
                  inp.className = 'name-input';
                  inp.value = slide.name || `Scene ${i + 1}`;
                  el.textContent = '';
                  el.appendChild(inp);
                  inp.focus();
                    inp.onblur = () => {
                      slide.name = inp.value || `Scene ${i + 1}`;
                      el.textContent = slide.name;
                      refreshSceneList();
                    };
                  inp.onkeydown = (ke) => { if (ke.key === 'Enter') inp.blur(); };
                }}
              >{slide.name || `Scene ${i + 1}`}</div>
              <div className="duration">{formatDuration(slide.duration || 0)}</div>
            </div>
            <button className="del-scene" title="Delete scene" onClick={(e) => { e.stopPropagation(); deleteScene(i); }}>
              <svg viewBox="0 0 12 12" width="12" height="12"><line x1="3" y1="3" x2="9" y2="9" stroke="currentColor" strokeWidth="1.5" /><line x1="9" y1="3" x2="3" y2="9" stroke="currentColor" strokeWidth="1.5" /></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
