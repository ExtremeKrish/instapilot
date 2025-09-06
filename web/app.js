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
        //alert(`Error saving caption: ${error.message}`);
      }
    });
  } catch (error) {
    //alert(`Error fetching caption: ${error.message}`);
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
          //alert(`Caption renamed from ${data.old} to ${data.new}`);
          
        } else {
          throw new Error('Failed to rename caption');
        }
        document.getElementById("caption-reload").click();

      } catch (error) {
        //alert(`Error renaming caption: ${error.message}`);
        console.log("Error:" + error);
      }
    });
  } catch (error) {
    //alert(`Error opening rename modal: ${error.message}`);
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
          //alert(`Caption ${filename} deleted successfully!`);
          
        } else {
          throw new Error('Failed to delete caption');
        }
        document.getElementById("caption-reload").click();

      } catch (error) {
        //alert(`Error deleting caption: ${error.message}`);
        console.log("Error:" + error);
      }
    });
  } catch (error) {
    //alert(`Error opening delete modal: ${error.message}`);
    console.log("Error:" + error);
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
          //alert(`Image renamed from ${data.old} to ${data.new}`);
        } else {
          throw new Error('Failed to rename image');
        }
        document.getElementById("images-reload").click();

      } catch (error) {
        //alert(`Error renaming image: ${error.message}`);
      }
    });
  } catch (error) {
    alert(`Error opening rename modal: ${error.message}`);
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
          //alert(`Image ${filename} deleted successfully!`);
        } else {
          throw new Error('Failed to delete image');
        }
      } catch (error) {
        //alert(`Error deleting image: ${error.message}`);
      }
      document.getElementById("images-reload").click();

    });
  } catch (error) {
    alert(`Error opening delete modal: ${error.message}`);
  }
}

