(function () {
  const vscode = acquireVsCodeApi();

  document.querySelector('#zoom-in').addEventListener('click', () => {
    const labelImage = document.querySelector('#label');
    const currentZoom = parseFloat(labelImage.style.zoom) || 1.0;

    labelImage.style.zoom = currentZoom + 0.1;
  });

  document.querySelector('#zoom-out').addEventListener('click', () => {
    const labelImage = document.querySelector('#label');
    const currentZoom = parseFloat(labelImage.style.zoom) || 1.0;

    labelImage.style.zoom = currentZoom - 0.1;
  });

  document.querySelector('#dpmn').addEventListener('change', (e) => {
    vscode.postMessage({
      type: 'dpmmChanged',
      value: parseInt(e.target.value),
    });
  });
})();
