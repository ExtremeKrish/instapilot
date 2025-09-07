class Toast {
    constructor() {
      this.container = null;
      this.initContainer();
    }

    initContainer() {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }

    show({ message, type = 'primary', duration = 3000, position = 'top-right' }) {
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;

      // Set icon based on type
      const icon = document.createElement('span');
      icon.className = 'toast-icon';
      switch (type) {
        case 'primary':
          icon.innerHTML = 'ℹ️'; // Info symbol
          break;
        case 'secondary':
          icon.innerHTML = '⚙️'; // Gear symbol
          break;
        case 'info':
          icon.innerHTML = '🔔'; // Bell symbol
          break;
        case 'danger':
          icon.innerHTML = '❌'; // Cross symbol
          break;
        case 'success':
          icon.innerHTML = '✅'; // Checkmark symbol
          break;
        case 'warning':
          icon.innerHTML = '⚠️'; // Warning symbol
          break;
        default:
          icon.innerHTML = 'ℹ️';
      }

      const messageEl = document.createElement('span');
      messageEl.textContent = message;

      toast.appendChild(icon);
      toast.appendChild(messageEl);

      // Set position
      this.container.style.top = position.includes('top') ? '20px' : 'auto';
      this.container.style.bottom = position.includes('bottom') ? '20px' : 'auto';
      this.container.style.left = position.includes('left') ? '20px' : 'auto';
      this.container.style.right = position.includes('right') ? '20px' : 'auto';
      this.container.style.flexDirection = position.includes('bottom') ? 'column-reverse' : 'column';

      this.container.appendChild(toast);

      // Show toast
      setTimeout(() => {
        toast.classList.add('show');
      }, 10);

      // Auto-close after duration
      setTimeout(() => {
        this.close(toast);
      }, duration);

      // Allow manual close on click
      toast.addEventListener('click', () => this.close(toast));
    }

    close(toast) {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove();
        }
      }, 300);
    }
  }
