   class ModalManager {
      constructor() {
        this.modals = {};
        this.modalCounter = 0;
      }

      // Create a new modal instance from a template
      createModal(templateId, modalId) {
        const template = document.getElementById(templateId);
        const modal = template.cloneNode(true);
        modal.id = `${templateId}-${modalId}`;
        modal.querySelector('[data-overlay]').id = `${templateId}-overlay-${modalId}`;
        modal.querySelector('[data-content]').id = `${templateId}-content-${modalId}`;
        document.body.appendChild(modal);
        return modal;
      }

      // Show modal with animations
      showModal(modal) {
        modal.classList.remove('hidden');
        const overlay = modal.querySelector('[data-overlay]');
        const content = modal.querySelector('[data-content]');
        setTimeout(() => {
          overlay.classList.replace('opacity-0', 'opacity-100');
          content.classList.replace('scale-95', 'scale-100');
          content.classList.replace('opacity-0', 'opacity-100');
        }, 10);
      }

      // Hide modal with animations
      hideModal(modal) {
        const overlay = modal.querySelector('[data-overlay]');
        const content = modal.querySelector('[data-content]');
        overlay.classList.replace('opacity-100', 'opacity-0');
        content.classList.replace('scale-100', 'scale-95');
        content.classList.replace('opacity-100', 'opacity-0');
        setTimeout(() => {
          modal.classList.add('hidden');
          modal.remove(); // Clean up modal from DOM
        }, 300);
      }

      // Open Edit Modal
      openEditModal(instanceId, initialContent, onSave) {
        const modalId = `edit-${this.modalCounter++}`;
        const modal = this.createModal('editModalTemplate', modalId);
        const textarea = modal.querySelector('[data-textarea]');
        const saveBtn = modal.querySelector('[data-save]');
        const cancelBtn = modal.querySelector('[data-cancel]');

        textarea.value = initialContent;
        this.showModal(modal);

        cancelBtn.onclick = () => this.hideModal(modal);
        saveBtn.onclick = () => {
          onSave(textarea.value);
          this.hideModal(modal);
        };

        this.modals[instanceId] = modal;
      }

      // Open Rename Modal
      openRenameModal(instanceId, initialName, onRename) {
        const modalId = `rename-${this.modalCounter++}`;
        const modal = this.createModal('renameModalTemplate', modalId);
        const input = modal.querySelector('[data-input]');
        const okBtn = modal.querySelector('[data-ok]');
        const cancelBtn = modal.querySelector('[data-cancel]');

        input.value = initialName;
        this.showModal(modal);

        cancelBtn.onclick = () => this.hideModal(modal);
        okBtn.onclick = () => {
          if (input.value.trim()) {
            onRename(input.value);
            this.hideModal(modal);
          }
        };

        this.modals[instanceId] = modal;
      }

      // Open Confirm Delete Modal
      openConfirmModal(instanceId, message, onConfirm) {
        const modalId = `confirm-${this.modalCounter++}`;
        const modal = this.createModal('confirmModalTemplate', modalId);
        const messageEl = modal.querySelector('[data-message]');
        const deleteBtn = modal.querySelector('[data-delete]');
        const cancelBtn = modal.querySelector('[data-cancel]');

        messageEl.textContent = message;
        this.showModal(modal);

        cancelBtn.onclick = () => this.hideModal(modal);
        deleteBtn.onclick = () => {
          onConfirm();
          this.hideModal(modal);
        };

        this.modals[instanceId] = modal;
      }

      // Close a specific modal instance
      closeModal(instanceId) {
        const modal = this.modals[instanceId];
        if (modal) {
          this.hideModal(modal);
          delete this.modals[instanceId];
        }
      }
    }

    // Initialize ModalManager
    const modalManager = new ModalManager();
