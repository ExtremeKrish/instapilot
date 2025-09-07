
async function toast(text, type) {
  const toast = new Toast();
  toast.show({
    message: text,
    type: type,
    duration: 3000,
    position: 'top-right'
  });
}

// === JOBS ===
async function editJob(filename) {
  try {
    // Fetch initial content as text
    const response = await fetch(`https://instapilot.onrender.com/jobs/get/${filename}`);
    if (!response.ok) throw new Error('Failed to fetch content');
    const content = await response.text();
    
    // Open edit modal with fetched content
    modalManager.openEditModal(filename, content, async (newContent) => {
      try {
        // Save updated content
        const saveResponse = await fetch(`https://instapilot.onrender.com/jobs/update/${filename}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'text/plain' },
          body: newContent
        });
        const saveData = await saveResponse.json();
        if (saveData.ok) {
          toast('Job updated successfully!', 'success');
        } else {
          throw new Error('Failed to save job');
        }
      } catch (error) {
        toast(`Error saving job: ${error.message}`, 'danger');
      }
    });
  } catch (error) {
    //
    toast(`Error fetching job: ${error.message}`, 'danger');
  }
}

async function renameJob(filename) {
  try {
    // Open rename modal with current filename
    modalManager.openRenameModal(filename, filename, async (newName) => {
      try {
        // Send rename request
        const response = await fetch(`https://instapilot.onrender.com/jobs/rename/${filename}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ new_filename: newName })
        });
        const data = await response.json();
        if (data.ok) {
          toast(`Caption renamed from ${data.old} to ${data.new}`, 'success');
          
        } else {
          throw new Error('Failed to rename job');
        }
        document.getElementById("jobs-reload").click();

      } catch (error) {
        toast(`Error renaming caption: ${error.message}`, 'danger');
        console.log("Error:" + error);
      }
    });
  } catch (error) {
    toast(`Error opening rename modal: ${error.message}`, 'danger');
    console.log("Error:" + error);
  }
}

async function deleteJob(filename) {
  try {
    // Open confirm delete modal with custom message
    modalManager.openConfirmModal(filename, `Are you sure you want to delete ${filename}? This action cannot be undone.`, async () => {
      try {
        // Send delete request
        const response = await fetch(`https://instapilot.onrender.com/jobs/delete/${filename}`, {
          method: 'DELETE'
        });
        const data = await response.json();
        if (data.ok) {
          toast(`Caption ${filename} deleted successfully!`, 'success');
          
        } else {
          throw new Error('Failed to delete job');
        }
        document.getElementById("jobs-reload").click();

      } catch (error) {
        toast(`Error deleting caption: ${error.message}`, 'danger');
        console.log("Error:" + error);
      }
    });
  } catch (error) {
    toast(`Error opening delete modal: ${error.message}`, 'danger');
    console.log("Error:" + error);
  }
}

async function createNewJob() {
  try {
    // Open rename modal with an empty filename to prompt for new filename
    modalManager.openRenameModal('new-job', '', async (newName) => {
      try {
        // Send create request
        const response = await fetch(`https://instapilot.onrender.com/jobs/${newName}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (data.ok) {
          toast(`Caption ${newName} created successfully!`, 'success');
        } else {
          throw new Error('Failed to create job');
        }
      } catch (error) {
        toast(`Error creating caption: ${error.message}`, 'danger');
      }
    });
  } catch (error) {
    toast(`Error opening create modal: ${error.message}`, 'danger');
  }
}

// === CAPTIONS === 
async function editCaption(filename) {
  try {
    // Fetch initial content
    const response = await fetch(`https://instapilot.onrender.com/captions/get/${filename}`);
    const data = await response.json();
    if (!response.ok) throw new Error('Failed to fetch content');
    
    // Open edit modal with fetched content
    modalManager.openEditModal(filename, data.content, async (newContent) => {
      try {
        // Save updated content
        const saveResponse = await fetch(`https://instapilot.onrender.com/captions/update/${filename}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'text/plain' },
          body: newContent
        });
        const saveData = await saveResponse.json();
        if (saveData.ok) {
          //('Caption updated successfully!');
        } else {
          throw new Error('Failed to save content');
        }
      } catch (error) {
        toast(`Error saving caption: ${error.message}`, 'danger');
      }
    });
  } catch (error) {
    toast(`Error fetching caption: ${error.message}`, 'danger');
  }
}

async function renameCaption(filename) {
  try {
    // Open rename modal with current filename
    modalManager.openRenameModal(filename, filename, async (newName) => {
      try {
        // Send rename request
        const response = await fetch(`https://instapilot.onrender.com/captions/rename/${filename}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ new_filename: newName })
        });
        const data = await response.json();
        if (data.ok) {
          toast(`Caption renamed from ${data.old} to ${data.new}`, 'success');
          
        } else {
          throw new Error('Failed to rename caption');
        }
        document.getElementById("caption-reload").click();

      } catch (error) {
        toast(`Error renaming caption: ${error.message}`, 'danger');
        console.log("Error:" + error);
      }
    });
  } catch (error) {
    toast(`Error opening rename modal: ${error.message}`, 'danger');
    console.log("Error:" + error);
  }
}

async function deleteCaption(filename) {
  try {
    // Open confirm delete modal with custom message
    modalManager.openConfirmModal(filename, `Are you sure you want to delete ${filename}? This action cannot be undone.`, async () => {
      try {
        // Send delete request
        const response = await fetch(`https://instapilot.onrender.com/captions/delete/${filename}`, {
          method: 'DELETE'
        });
        const data = await response.json();
        if (data.ok) {
          toast(`Caption ${filename} deleted successfully!`, 'success');
          
        } else {
          throw new Error('Failed to delete caption');
        }
        document.getElementById("caption-reload").click();

      } catch (error) {
        toast(`Error deleting caption: ${error.message}`, 'danger');
        console.log("Error:" + error);
      }
    });
  } catch (error) {
    toast(`Error opening delete modal: ${error.message}`, 'danger');
    console.log("Error:" + error);
  }
}

async function createNewCaption() {
  try {
    // Open rename modal with an empty filename to prompt for new filename
    modalManager.openRenameModal('new-caption', '', async (newName) => {
      try {
        // Send create request
        const response = await fetch(`https://instapilot.onrender.com/captions/${newName}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (data.ok) {
          toast(`Caption ${newName} created successfully!`, 'success');
        } else {
          throw new Error('Failed to create caption');
        }
      } catch (error) {
        toast(`Error creating caption: ${error.message}`, 'danger');
      }
    });
  } catch (error) {
    toast(`Error opening create modal: ${error.message}`, 'danger');
  }
}

async function renameImage(filename) {
  try {
    // Open rename modal with current filename
    modalManager.openRenameModal(filename, filename, async (newName) => {
      try {
        // Send rename request
        const response = await fetch(`https://instapilot.onrender.com/bg_images/rename/${filename}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ new_filename: newName })
        });
        const data = await response.json();
        if (data.ok) {
          toast(`Image renamed from ${data.old} to ${data.new}`, 'success');
        } else {
          throw new Error('Failed to rename image');
        }
        document.getElementById("images-reload").click();

      } catch (error) {
        toast(`Error renaming image: ${error.message}`, 'danger');
      }
    });
  } catch (error) {
    toast(`Error opening rename modal: ${error.message}`, 'danger');
  }
}

async function deleteImage(filename) {
  try {
    // Open confirm delete modal with custom message
    modalManager.openConfirmModal(filename, `Are you sure you want to delete ${filename}? This action cannot be undone.`, async () => {
      try {
        // Send delete request
        const response = await fetch(`https://instapilot.onrender.com/bg_images/delete/${filename}`, {
          method: 'DELETE'
        });
        const data = await response.json();
        if (data.ok) {
          toast(`Image ${filename} deleted successfully!`, 'success');
        } else {
          throw new Error('Failed to delete image');
        }
      } catch (error) {
        toast(`Error deleting image: ${error.message}`, 'danger');
      }
      document.getElementById("images-reload").click();

    });
  } catch (error) {
    toast(`Error opening delete modal: ${error.message}`, 'danger');
  }
}

 