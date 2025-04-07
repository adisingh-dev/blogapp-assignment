document.querySelector('.container')
.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = e.target.title.value;
    const excerpt = e.target.excerpt.value;
    const body = e.target.body.value;
    const thumbnail = e.target.thumbnail.files[0];
    const blogid = e.target.blogid.value;

    const formdata = new FormData();
    formdata.append('blogid', blogid);
    formdata.append('title', title);
    formdata.append('excerpt', excerpt);
    formdata.append('body', body);
    formdata.append('thumbnail', thumbnail);

    fetch(`/api/v1/blog`, {
        method: 'post',
        body: formdata,
    })
    .then(res => res.json())
    .then(res => alert(res.message));
});