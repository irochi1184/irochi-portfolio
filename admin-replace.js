const baseRenderWorks = renderWorks;

renderWorks = function () {
  baseRenderWorks();
  attachReplaceControls();
};

function attachReplaceControls() {
  const cards = [...worksList.querySelectorAll('.work-editor-card')];

  cards.forEach((card, index) => {
    const work = works[index];
    if (!work) return;

    const replaceInput = card.querySelector('.replace-input');
    const undoButton = card.querySelector('.undo-replace');
    const badge = card.querySelector('.new-badge');

    if (work.isReplacement) {
      badge.textContent = '差し替え';
      badge.classList.remove('hidden');
      badge.classList.add('replaced');
      undoButton.classList.remove('hidden');
    } else if (work.isNew) {
      badge.textContent = 'NEW';
      badge.classList.remove('replaced');
    } else {
      badge.classList.remove('replaced');
    }

    replaceInput?.addEventListener('change', async event => {
      const file = event.target.files?.[0];
      if (!file) return;

      setBusy(true);
      try {
        const converted = await imageToWebp(file);

        if (!work.originalBeforeReplacement) {
          work.originalBeforeReplacement = {
            src: work.src,
            previewUrl: work.previewUrl || '',
            blob: work.blob || null,
            isNew: Boolean(work.isNew),
            isReplacement: Boolean(work.isReplacement)
          };
        }

        if (work.previewUrl && work.previewUrl !== work.originalBeforeReplacement.previewUrl) {
          URL.revokeObjectURL(work.previewUrl);
        }

        work.previewUrl = URL.createObjectURL(converted.blob);
        work.blob = converted.blob;

        if (!work.originalBeforeReplacement.isNew) {
          const filename = timestampName(`replace-${Date.now()}`, converted.ext);
          work.src = `assets/${filename}`;
          work.isNew = true;
          work.isReplacement = true;
        } else {
          work.isNew = true;
          work.isReplacement = true;
        }

        renderWorks();
      } catch (error) {
        showStatus(`<p>画像の差し替えに失敗しました。</p><p>${escapeHtml(error.message)}</p>`, 'error');
      } finally {
        event.target.value = '';
        setBusy(false);
      }
    });

    undoButton?.addEventListener('click', () => {
      const original = work.originalBeforeReplacement;
      if (!original) return;

      if (work.previewUrl && work.previewUrl !== original.previewUrl) {
        URL.revokeObjectURL(work.previewUrl);
      }

      work.src = original.src;
      work.previewUrl = original.previewUrl;
      work.blob = original.blob;
      work.isNew = original.isNew;
      work.isReplacement = original.isReplacement;
      work.originalBeforeReplacement = null;
      renderWorks();
    });
  });
}
