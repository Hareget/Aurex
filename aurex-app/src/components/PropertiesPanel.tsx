import { useCanvas } from '../CanvasContext';

export default function PropertiesPanel() {
  const { showProps, propsTarget, canvas, saveSlide, refreshSceneList, closeProperties } = useCanvas();

  console.log('PropsPanel: showProps=', showProps, 'propsTarget=', propsTarget?.type);

  if (!showProps || !propsTarget) {
    return <div id="propsPanel"></div>;
  }

  const obj = propsTarget;
  const isText = obj.type === 'i-text' || obj.type === 'textbox';

  const set = (prop: string, value: any) => {
    obj.set(prop as any, value);
    canvas?.renderAll();
    saveSlide();
  };

  return (
    <div id="propsPanel" className="open">
      <div id="propsInner">
        <h3>
          Properties
          <button onClick={() => { canvas?.discardActiveObject().renderAll(); closeProperties(); }}>
            <svg viewBox="0 0 14 14" width="14" height="14"><line x1="3" y1="3" x2="11" y2="11" stroke="currentColor" strokeWidth="1.5" /><line x1="11" y1="3" x2="3" y2="11" stroke="currentColor" strokeWidth="1.5" /></svg>
          </button>
        </h3>

        {isText && (
          <>
            <h4>Text Settings</h4>
            <PropRow label="Font">
              <select value={obj.fontFamily || 'Arial'} onChange={e => set('fontFamily', e.target.value)}>
                {['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana'].map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </PropRow>
            <PropRow label="Size">
              <input type="range" min={8} max={120} value={obj.fontSize || 36}
                onChange={e => set('fontSize', +e.target.value)} />
              <span className="val">{obj.fontSize || 36}</span>
            </PropRow>
            <PropRow label="Fill">
              <input type="color" value={obj.fill || '#000000'} onChange={e => set('fill', e.target.value)} />
            </PropRow>
          </>
        )}

        {!isText && (
          <>
            <h4>Shape Settings</h4>
            <PropRow label="Fill">
              <input type="color" value={obj.fill || '#4a90d9'} onChange={e => set('fill', e.target.value)} />
            </PropRow>
          </>
        )}

        <h4>Border</h4>
        <PropRow label="Color">
          <input type="color" value={obj.stroke || '#333333'} onChange={e => set('stroke', e.target.value)} />
        </PropRow>
        <PropRow label="Width">
          <input type="range" min={0} max={20} value={obj.strokeWidth || 0}
            onChange={e => set('strokeWidth', +e.target.value)} />
          <span className="val">{obj.strokeWidth || 0}</span>
        </PropRow>

        <h4>Animation</h4>
        <PropRow label="Effect">
          <select value={obj.customAnimation || ''} onChange={e => { set('customAnimation', e.target.value); refreshSceneList(); }}>
            {[
              ['', 'None'],
              ['fadeIn', 'Fade In'],
              ['slideInLeft', 'Slide In Left'],
              ['slideInRight', 'Slide In Right'],
              ['slideInTop', 'Slide In Top'],
              ['slideInBottom', 'Slide In Bottom'],
              ['zoomIn', 'Zoom In'],
              ['bounce', 'Bounce'],
              ['rotate', 'Rotate'],
              ['flip', 'Flip'],
            ].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </PropRow>
        <PropRow label="Duration">
          <input type="range" min={100} max={5000} step={100} value={obj.animDuration || 500}
            onChange={e => { set('animDuration', +e.target.value); refreshSceneList(); }} />
          <span className="val">{(obj.animDuration || 500)}ms</span>
        </PropRow>
        <PropRow label="Delay">
          <input type="range" min={0} max={3000} step={100} value={obj.animDelay || 0}
            onChange={e => { set('animDelay', +e.target.value); refreshSceneList(); }} />
          <span className="val">{(obj.animDelay || 0)}ms</span>
        </PropRow>
      </div>
    </div>
  );
}

function PropRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="prop-row">
      <label>{label}</label>
      {children}
    </div>
  );
}
