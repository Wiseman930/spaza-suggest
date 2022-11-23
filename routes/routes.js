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
    async function ownerRoute(req, res){
      let shopName = req.body.shop;
      let code = req.body.code;

      let  storedCode = await db.oneOrNone('SELECT COUNT(*) FROM spaza WHERE code=$1', [code])
      let  storeName = await db.oneOrNone('SELECT shop_name FROM spaza WHERE id=$1', [shopName])


      if(shopName == '' && code == '' ){

       req.flash('errors', 'Enter Shop and Code')
       res.redirect('/spaza_login');
     }
     if(shopName != '' && code == '' ){

       req.flash('errors', 'Enter Code');
       res.redirect('/spaza_login');
     }
     if(shopName == '' && code != '' ){
       req.flash('errors', 'Enter Shop')
       res.redirect('/spaza_login');
     }
     if(shopName != '' && code != '' && storedCode.count == 1 ){
       res.redirect(`/owner/${storeName.shop_name}`);
     }
     }
     async function dynamicSpaza (req, res) {
      let enterSpaza = req.params.spazaname;
      let registerSpaza = enterSpaza;
      let  storeName = await db.oneOrNone('SELECT area_id FROM spaza WHERE shop_name=$1', [enterSpaza])
      let area_id;
      if(storeName !== null){
        area_id = storeName.area_id;
      }
      let  product = await db.oneOrNone('SELECT product_name FROM suggestion WHERE area_id=$1', [area_id])
      let myProduct;
      if(product !== null){
        myProduct = product.product_name;
      }

      let client_ID = await db.oneOrNone('SELECT client_id FROM suggestion WHERE area_id=$1', [area_id])
      let id;
      let username;
      let names;
      if(client_ID !== null){
        id = (client_ID.client_id)
        username =  await db.oneOrNone('SELECT username FROM spaza_client WHERE id=$1', [id])
        names = username.username;
      }


      res.render('owner',
      {
      registerSpaza,
      myProduct,
      names

    });

    }

    async function dynamicSpazaPost (req, res) {
      let enterSpaza = req.params.username;


      res.redirect(`/client/${enterSpaza}`);

    }
    return{
        home,
        postRegisterCode,
        login,
        userRoute,
        dynamicClent,
        dynamicClentPost,
        ownerLogin,
        ownerRoute,
        dynamicSpaza,
        dynamicSpazaPost


    }
}

