# Visualyze

### Contributors

- Peter Carmichael
- Sarah Gilliam
- Jonathan Kimball

### About

- At Visualyze we provide our customers with a way to view data from all over the planet, in one spot. We offer full customization for what data you want to see and how you want to see it.

### Deployed Link

- Deployment is made through Heroku for the back end, and Firebase for the front.
- [Click here](https://d32-final-sarah-jon-peter.web.app/) to launch the site.

### To begin

- Run npm install on front and back end repo's
- [Front End](https://github.com/visualyze/front-end)
- [Back End](https://github.com/visualyze/back-end)

### .env Variables for back end

- `darksky=YOUR_KEY_HERE`
- `geodata=YOUR_KEY_HERE`

### .env Variables for front end

- `REACT_APP_API_URL=https://pc-sd-jk-visualyze.herokuapp.com/`

### How it Works

- Sign up via an email and password of your choice or sign in with Google
- Login in with your credentials
- Navigate to the dashboard and create your own customized data visualization
  - Click on the plus icon to add wigets
  - Use the "X" icon in the top right of each widget card to delete it
  - To change the city selected, us the settings icon in the top right
  - Resize the widgets by grabbing and dragging the bottom right corner

### Database & Saving the Dashboard Config

- Once you are signed in, your dashboard will automatically save each time you make a change.
- The dashboard configuration is stored in the Firebase database, and will automatically load next time you visit the site with the same login the configuration was saved to.
