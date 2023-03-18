import { generate } from 'critical';

generate({
  inline: true,
  base: '/Users/Ajay c/Desktop/my-blog',
  src: '/Users/Ajay c/Desktop/my-blog/views/header.ejs',
  target: '/Users/Ajay c/Desktop/my-blog/views/header-critical.ejs',
  css: ['https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css'],
  width: 375,
  height: 667,
}, (err, output) => {
  if (err) {
    console.error(err);
  }
  console.log('Critical CSS generated successfully!');
});
