module.exports = function suggestionRoute(db, spazaSuggest){

  let shortCode = require('short-unique-id')
  let uid = new shortCode({length: 6})


    function home (req, res) {
        res.render('register');
      }

    async function postRegisterCode(req, res){
      let code = uid()
      let users = req.body.fname
      let format = /^[A-Za-z]+$/

     let uppercase = users.toUpperCase();
      await spazaSuggest.countOfUser(uppercase)
      let wordCount = spazaSuggest.returnCountUser()

      if (format.test(users) == true && wordCount == 0){
      req.flash('codeMessages', 'login passcode: ' + code)
      await spazaSuggest.registerClient(uppercase, code)
      res.redirect('/');
      }
      else if (format.test(users) == true && wordCount == 1){
      req.flash('errorMessages', 'you are registered')
        res.redirect('/');
        }
      else if (format.test(users) == false){
      req.flash('errorMessages', 'enter alphabets only')
        res.redirect('/')
      }
    }

    function login (req, res) {
      res.render('index');
    }

      async function userRoute (req, res) {
      let userCode = req.body.fname
      await spazaSuggest.clientLogin(userCode)

      let name = await spazaSuggest.returnNameAndCode()
      let format = /^[A-Za-z]+$/
      let storedCode = await spazaSuggest.returnNameAndCode()

      if (storedCode.coding == 1 && name.naming !== 'ADMIN'){
      let upperName = name.naming.toUpperCase()
      //waitersFunction.loginNames(upperName)
      res.redirect(`/client/${upperName}`);
      }
     /* else if (storedCode.coding == 1 && name.naming == 'ADMIN'){
        res.redirect('/spaza');
        }*/
      else if (storedCode.coding == 0 || storedCode.coding == undefined){
        req.flash('errors', 'invalid passcode')
        res.redirect('/index');
        }
      else if (format.test(name.naming) == false){
        req.flash('errors', 'enter alphabets only')
        res.redirect('/')
      }
    }
    async function dynamicClent (req, res) {
      let enterName = req.params.username;
      let registerName = enterName.toUpperCase()
      let areas = await spazaSuggest.areas()

      res.render('client',
      {areas,
      registerName});

    }
    async function dynamicClentPost (req, res) {
      let enterName = req.params.username;
      let enterSuggesstion = req.body.suggest;
      let enterArea = req.body.area;
      let uppercaseName = enterName.toUpperCase()
      let getClient_id = await db.oneOrNone('SELECT id FROM spaza_client WHERE username=$1', [uppercaseName])
      let client_id = getClient_id.id;


      if(enterArea == '' && enterSuggesstion == '' ){
        req.flash('errors', 'Enter Area and suggestion')
      }
      if(enterArea != '' && enterSuggesstion == '' ){
        req.flash('errors', 'Enter Area')
      }
      if(enterArea == '' && enterSuggesstion != '' ){
        req.flash('errors', 'Enter suggestion')
      }
      if(enterArea != '' && enterSuggesstion != '' ){
        spazaSuggest.suggestProduct(enterArea, client_id, enterSuggesstion)
        req.flash('errors', 'You have added a suggestion')
      }

      res.redirect(`/client/${uppercaseName}`);
    }
    async function ownerLogin(req, res){
      let spazaShop = await spazaSuggest.allShops()

      res.render('spaza_login',
        {spazaShop})
    }
    return{
        home,
        postRegisterCode,
        login,
        userRoute,
        dynamicClent,
        dynamicClentPost,
        ownerLogin


    }
}

