const api = '/students'; // relative path (server serves same origin)

const form = document.getElementById('studentForm');
const studentsContainer = document.getElementById('students');
const refreshBtn = document.getElementById('refreshBtn');
const resetBtn = document.getElementById('resetBtn');

async function loadStudents(){
  try{
    const res = await fetch(api);
    const data = await res.json();
    renderStudents(data);
  }catch(err){
    console.error('Load error', err);
    studentsContainer.innerHTML = `<p style="color:tomato">Failed to load students</p>`;
  }
}

function renderStudents(list){
  studentsContainer.innerHTML = '';
  if(!list || list.length === 0){
    studentsContainer.innerHTML = '<p style="color:#666">No students yet. Add one above.</p>';
    return;
  }

  list.forEach(s => {
    const el = document.createElement('div');
    el.className = 'student';
    el.innerHTML = `
      <div>
        <h3>${escapeHtml(s.name)}</h3>
        <p><strong>Email:</strong> ${escapeHtml(s.email)}</p>
        <p><strong>Course:</strong> ${escapeHtml(s.course)}</p>
        <p style="color:#999;font-size:12px">ID: ${s.id}</p>
      </div>
      <div class="card-footer">
        <button class="btn" onclick="fillEdit(${s.id})">Edit</button>
        <button class="btn danger" onclick="removeStudent(${s.id})">Delete</button>
      </div>
    `;
    studentsContainer.appendChild(el);
  });
}

function escapeHtml(str){
  if(!str) return '';
  return String(str)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const idField = document.getElementById('studentId');
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const course = document.getElementById('course').value.trim();

  if(!name || !email || !course){
    alert('Please fill all fields');
    return;
  }

  try{
    if(idField.value){
      // update
      const res = await fetch(`${api}/${idField.value}`, {
        method: 'PUT',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ name, email, course })
      });
      const txt = await res.text();
      alert(txt);
    } else {
      // create
      const res = await fetch(api, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ name, email, course })
      });
      const txt = await res.text();
      alert(txt);
    }
    resetForm();
    loadStudents();
  }catch(err){
    console.error(err);
    alert('Request failed');
  }
});

function fillEdit(id){
  // fetch single student (optional) then fill form
  fetch(`${api}/${id}`)
    .then(r => {
      if (!r.ok) throw new Error('Not found');
      return r.json();
    })
    .then(s => {
      document.getElementById('studentId').value = s.id;
      document.getElementById('name').value = s.name;
      document.getElementById('email').value = s.email;
      document.getElementById('course').value = s.course;
      window.scrollTo({top:0,behavior:'smooth'});
    })
    .catch(err => {
      console.error(err);
      alert('Failed to fetch student');
    });
}

async function removeStudent(id){
  if(!confirm('Delete this student?')) return;
  try{
    const res = await fetch(`${api}/${id}`, { method: 'DELETE' });
    const txt = await res.text();
    alert(txt);
    loadStudents();
  }catch(err){
    console.error(err);
    alert('Delete failed');
  }
}

function resetForm(){
  document.getElementById('studentId').value = '';
  form.reset();
}

refreshBtn.addEventListener('click', loadStudents);
resetBtn.addEventListener('click', resetForm);

// initial load
loadStudents();
