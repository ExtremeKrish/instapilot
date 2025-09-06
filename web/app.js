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
          alert(`Caption renamed from ${data.old} to ${data.new}`);
        } else {
          throw new Error('Failed to rename caption');
        }
      } catch (error) {
        alert(`Error renaming caption: ${error.message}`);
      }
    });
  } catch (error) {
    alert(`Error opening rename modal: ${error.message}`);
  }
}

function deleteCaption(filename) {
  modalManager.openConfirmModal('file1.txt', 'Delete file1.txt?', () => console.log('File1 Deleted!'))
}