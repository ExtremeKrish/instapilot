function editCaption(filename) {
  
  
  modalManager.openEditModal('file1.txt', 'Initial content for file1', (content) => {
    
    alert("done");
  })
}

function renameCaption(filename) {
  modalManager.openRenameModal('file1.txt', 'file1.txt', (newName) => console.log('File1 Renamed to:', newName))
}

function deleteCaption(filename) {
  modalManager.openConfirmModal('file1.txt', 'Delete file1.txt?', () => console.log('File1 Deleted!'))
}