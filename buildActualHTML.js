import * as mysql from 'mysql';
import fs from 'fs';
import moment from 'moment';

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "eduwisecafedb"
});

function getDataForBuildHTML() {
    let sqlQ = `SELECT * from topics WHERE isTextcreated = 1 AND isImageCreated = 1 AND isImageCompressed = 1 AND isHTMLcreated IS NULL LIMIT 20`
    con.query(sqlQ, async function (err, rows, fields) {
        if (err) throw err;
        await buildHtml(rows);
        

        buildTagsJSON();
        
        buildSitemap()


    });
}


async function buildHtml(rows) {
    let sizeofDB = rows.length;
    if (sizeofDB == 0) {
        socketIo.emit('trigger', 'Already Updated')
        return;
    }

    for (let i = 0; i < rows.length; i++) {
        socketIo.emit('trigger', rows[i]['id'] + "-" + rows[i]['header'])
        // socketIo.emit('trigger', rows[i]['c2'])

        fs.readFile(rows[i]['c1'], 'utf-8', (err, textData)=>{

            if(err) throw err;

            let htmlFileName = rows[i]["header"]
                    .replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '')
                    .replaceAll(" ","-") 
            + "-" + rows[i]['id'] +".html"

            let HTMLbody = `
            
            <!DOCTYPE html>
            <html lang="en" data-theme="light">
            
            <head>
                <title>${rows[i]['header']}</title>

                <meta name="google-site-verification" content="x4cmLaarjjyHoAaWLIURfePzVXCZ5r9x3iyQRwcZXOs" />
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta data-rh="true" charset="UTF-8">
                <link rel="icon" type="image/x-icon" href="https://eduwisecafe.web.app/static/blog.svg">
                <meta name="description" content="${rows[i]['description'].substring(0,200)+'...'}">
                <meta name="keywords" content="${rows[i]['header']}">
                <meta name="author" content="eduwisecafe">
            
                <meta data-rh="true" name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1,maximum-scale=1">
                <meta data-rh="true" name="theme-color" content="#000000">
                <meta data-rh="true" property="og:site_name" content="eduwisecafe">
                <link data-rh="true" rel="icon" href="https://eduwisecafe.web.app/static/blog.svg">
                <link data-rh="true" rel="apple-touch-icon" sizes="152x152" href="https://eduwisecafe.web.app/static/icon-152.jpg">
                <link data-rh="true" rel="apple-touch-icon" sizes="120x120" href="https://eduwisecafe.web.app/static/icon-120.jpg">
                <link data-rh="true" rel="apple-touch-icon" sizes="76x76" href="https://eduwisecafe.web.app/static/icon-76.jpg">
                <link data-rh="true" rel="apple-touch-icon" sizes="60x60" href="https://eduwisecafe.web.app/static/icon-60.jpg">
                <link data-rh="true" rel="mask-icon" href="https://eduwisecafe.web.app/static/icon-500.jpg" color="#171717">
                <link rel="author" href="https://eduwisecafe.web.app/" data-rh="true">
                <link rel="canonical" href="https://eduwisecafe.web.app/" data-rh="true">
                <meta property="og:type" content="article" data-rh="true">
                <meta property="article:published_time" content="${moment().format()}" data-rh="true">
                <meta name="title" content="${rows[i]['header']}" data-rh="true">
                <meta property="og:title" content="${rows[i]['header']}" data-rh="true">
                <meta name="description" content="${rows[i]['description'].substring(0,200)+'...'}" data-rh="true">
                <meta property="og:description" content="${rows[i]['description'].substring(0,200)+'...'}" data-rh="true">
                <meta property="og:url" content="${'https://eduwisecafe.web.app/blog/'+htmlFileName}" data-rh="true">
                <meta property="al:web:url" content="${'https://eduwisecafe.web.app/blog/'+htmlFileName}" data-rh="true">
                <meta property="og:image" content="${'https://eduwisecafe.web.app/images/'+rows[i]['ImageName']}" data-rh="true">
                <meta property="article:author" content="https://eduwisecafe.web.app" data-rh="true">
                <meta name="author" content="eduwisecafe" data-rh="true">
                <meta name="robots" content="index,follow,max-image-preview:large" data-rh="true">
                <meta name="referrer" content="unsafe-url" data-rh="true">
                <meta property="twitter:title" content="${rows[i]['header']}" data-rh="true">
                <meta name="twitter:site" content="@eduwisecafe" data-rh="true">
                <meta property="twitter:description" content="${rows[i]['description'].substring(0,200)+'...'}" data-rh="true">
                <meta name="twitter:image:src" content="${'https://eduwisecafe.web.app/images/'+rows[i]['ImageName']}" data-rh="true">
                <meta name="twitter:card" content="summary_large_image" data-rh="true">
                <meta name="twitter:label1" content="Reading time" data-rh="true">
                <meta name="twitter:data1" content="${rows[i]['header']}" data-rh="true">
                <meta name="twitter:tile:template:testing" content="2" data-rh="true">
                <meta name="twitter:tile:image" content="${'https://eduwisecafe.web.app/images/'+rows[i]['ImageName']}" data-rh="true">
                <meta name="twitter:tile:info1:icon" content="Person" data-rh="true">
                <meta name="twitter:tile:info1:text" content="eduwisecafe" data-rh="true">
                <meta name="twitter:tile:info2:icon" content="Calendar" data-rh="true">
                <meta name="twitter:cta" content="Read on eduwisecafe" data-rh="true">
                <script type="application/ld+json" data-rh="true">
                    {
                        "@context": "http:\u002F\u002Fschema.org",
                        "@type": "NewsArticle",
                        "headline": "${rows[i]['header']}",
                        "name": "${rows[i]['header']}",
                        "description": "${rows[i]['description'].substring(0,200)+'...'}",
                        "publisher": {
                            "@type": "Organization",
                            "name": "eduwisecafe",
                            "url": "https:\u002F\u002Feduwisecafe.web.app\u002Fblog\u002F${htmlFileName}",
                            "logo": {
                                "@type": "ImageObject",
                                "width": 512,
                                "height": 512,
                                "url": "${'https:\u002F\u002Feduwisecafe.web.app\u002Fimages\u002F'+rows[i]['ImageName']}"
                            }
                        }
                    }
                </script>
            
                <!-- Style and title START -->
                <link rel="stylesheet" href="../static/bootstrap-grid.min.css">
                <link rel="stylesheet" href="../static/pico.min.css">
                <link rel="stylesheet" href="../static/customCSS.css">
                <link rel="stylesheet" href="../blog_css.css">
                <!-- Style and title END -->

                <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5697692834870795" crossorigin="anonymous"></script>
            
            </head>
            
            <body>
                <nav class="container-fluid">
                    <ul>
                        <a href="https://eduwisecafe.web.app" class="contrast"><strong><img src="https://eduwisecafe.web.app/static/blog.svg" alt="" srcset=""> Eduwise
                                Cafe</strong></a>
                    </ul>
                    <ul>
                        <li><button class="contrast" onclick="toggleMode()" id="themetoggler" role="button">
                            Dark Mode 🌚
                        </button></li>
                    </ul>
                </nav>
                <main class='container-lg'>
                    <div class="row" id="itemTop1"></div>
                    <div class="row" id="itemTop2"></div>
            
                    <div class="row justify-content-between" id='blogDiv'>
                        <div class="col-md-8" id='home-left'>
                            <article articleBody itemscope itemtype="https://schema.org/Article">
                                
                                <meta itemprop="datePublished" content="${moment().format()}">
                                <meta itemprop="dateModified" content="${moment().format()}">
                                <meta itemprop="image" content="https://eduwisecafe.web.app/images/${rows[i]['ImageName']}">
                                <meta itemprop="publisher" content="eduwisecafe.web.app">
            
                                <mark>🕗 ${moment().format('MMMM Do YYYY')}</mark>
                                <h2 class="" id="headline" itemprop="name headline" data-headline="${rows[i]['header']}">${rows[i]['header']}</h2>
                                <a itemprop="author" name="${rows[i]['subtopic']}" href="https://eduwisecafe.web.app/topic.html?topic=${rows[i]['subtopic']}">
                                    <kbd id="tag" itemprop="genre" data-tag="${rows[i]['subtopic']}">${rows[i]['subtopic']}</kbd>
                                </a>
                                
                                <hr>
                                <figure style="text-align: center;"> 
                                    <img itemprop="image" style="border-radius: 10px;" src="https://eduwisecafe.web.app/images/${rows[i]['ImageName']}" alt="${rows[i]['header']}" srcset="">
                                    <figcaption>📷 ${rows[i]['header']}</figcaption>
                                </figure>
                                <div class="a2a_kit a2a_kit_size_32 a2a_default_style" data-a2a-url="">
                                    <a class="a2a_button_copy_link"></a>
                                    <a class="a2a_button_twitter"></a>
                                    <a class="a2a_button_linkedin"></a>
                                    <a class="a2a_button_whatsapp"></a>
                                    <a class="a2a_button_facebook"></a>
                                    <a class="a2a_button_email"></a>
                                    <a class="a2a_button_telegram"></a>
                                </div>
                                <p></p>
            
                                <!-- article start -->

                                ${textData}
            
                                <!-- article END -->
                            </article>
                        </div>
            
                        <div class='col-md-4' id='home-right'>
                            <article>
                                <h3 class="secondary">Similar article 📃</h3>
                                <div id="similar_article" class="mt-4">
                                    No article are available at the moment, check back later 🙂
                                </div>
                            </article>
                        </div>
                    </div>
            
                    <div class="row" id="itemBottom1"></div>
                    <div class="row" id="itemBottom2"></div>
                    <div class="row" id="itemBottom3"></div>
            
            
                    <!-- Subscribe START -->
                    <section aria-label="Subscribe example">
                        <div>
                            <article class="container-lg">
                                <hgroup>
                                    <h2>Subscribe 🎉</h2>
                                    <h3>Get our best content in your inbox</h3>
                                </hgroup>
                                <form class="grid">
                                    <input type="text" id="firstname" name="firstname" placeholder="First name"
                                        aria-label="First name" required>
                                    <input type="email" id="email" name="email" placeholder="Email address"
                                        aria-label="Email address" required>
                                    <button type="submit" id="subscribeBTN" onclick="event.preventDefault()">Subscribe 💙
                                    </button>
                                </form>
                            </article>
                        </div>
                    </section>
                    <!-- Subscribe END -->


                    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5697692834870795"
                        crossorigin="anonymous"></script>
                    <!-- new 2 -->
                    <ins class="adsbygoogle"
                        style="display:block"
                        data-ad-client="ca-pub-5697692834870795"
                        data-ad-slot="3301308967"
                        data-ad-format="auto"
                        data-full-width-responsive="true"></ins>
                    <script>
                        (adsbygoogle = window.adsbygoogle || []).push({});
                    </script>

                    
            
            
                    <!-- Share page BEGIN -->
                    <p>Share this article 🎙</p>
                    <div class="a2a_kit a2a_kit_size_32 a2a_default_style" data-a2a-url="">
                        <a class="a2a_button_copy_link"></a>
                        <a class="a2a_button_twitter"></a>
                        <a class="a2a_button_linkedin"></a>
                        <a class="a2a_button_whatsapp"></a>
                        <a class="a2a_button_facebook"></a>
                        <a class="a2a_button_email"></a>
                        <a class="a2a_button_telegram"></a>
                    </div>
                    <!-- Share page END -->
            
                    <div class="row" id="itemBottom4"></div>
                    <div class="row" id="itemBottom5"></div>
                    <div class="row" id="itemBottom6"></div>
            
                </main>
            
                <!-- Footer -->
                <footer class="container-lg">
                    <small>Built with ❤ in India
                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 36 36">
                            <path fill="#138808" d="M0 27a4 4 0 0 0 4 4h28a4 4 0 0 0 4-4v-5H0v5z" />
                            <path fill="#F93" d="M36 14V9a4 4 0 0 0-4-4H4a4 4 0 0 0-4 4v5h36z" />
                            <path fill="#F7F7F7" d="M0 13.667h36v8.667H0z" />
                            <circle cx="18" cy="18" r="4" fill="navy" />
                            <circle cx="18" cy="18" r="3.375" fill="#F7F7F7" />
                            <path fill="#6666B3"
                                d="m18.1 16.75l-.1.65l-.1-.65l.1-1.95zm-.928-1.841l.408 1.909l.265.602l-.072-.653zm-.772.32l.888 1.738l.412.513l-.238-.613zm-.663.508l1.308 1.45l.531.389l-.389-.531zm-.508.663l1.638 1.062l.613.238l-.513-.412zm-.32.772l1.858.601l.653.072l-.602-.265zM14.8 18l1.95.1l.65-.1l-.65-.1zm.109.828l1.909-.408l.602-.265l-.653.072zm.32.772l1.738-.888l.513-.412l-.613.238zm.508.663l1.45-1.308l.389-.531l-.531.389zm.663.508l1.062-1.638l.238-.613l-.412.513zm.772.32l.601-1.858l.072-.653l-.265.602zM18 21.2l.1-1.95l-.1-.65l-.1.65zm.828-.109l-.408-1.909l-.265-.602l.072.653zm.772-.32l-.888-1.738l-.412-.513l.238.613zm.663-.508l-1.308-1.45l-.531-.389l.389.531zm.508-.663l-1.638-1.062l-.613-.238l.513.412zm.32-.772l-1.858-.601l-.653-.072l.602.265zM21.2 18l-1.95-.1l-.65.1l.65.1zm-.109-.828l-1.909.408l-.602.265l.653-.072zm-.32-.772l-1.738.888l-.513.412l.613-.238zm-.508-.663l-1.45 1.308l-.389.531l.531-.389zm-.663-.508l-1.062 1.638l-.238.613l.412-.513zm-.772-.32l-.601 1.858l-.072.653l.265-.602z" />
                            <g fill="navy">
                                <circle cx="17.56" cy="14.659" r=".2" />
                                <circle cx="16.71" cy="14.887" r=".2" />
                                <circle cx="15.948" cy="15.326" r=".2" />
                                <circle cx="15.326" cy="15.948" r=".2" />
                                <circle cx="14.887" cy="16.71" r=".2" />
                                <circle cx="14.659" cy="17.56" r=".2" />
                                <circle cx="14.659" cy="18.44" r=".2" />
                                <circle cx="14.887" cy="19.29" r=".2" />
                                <circle cx="15.326" cy="20.052" r=".2" />
                                <circle cx="15.948" cy="20.674" r=".2" />
                                <circle cx="16.71" cy="21.113" r=".2" />
                                <circle cx="17.56" cy="21.341" r=".2" />
                                <circle cx="18.44" cy="21.341" r=".2" />
                                <circle cx="19.29" cy="21.113" r=".2" />
                                <circle cx="20.052" cy="20.674" r=".2" />
                                <circle cx="20.674" cy="20.052" r=".2" />
                                <circle cx="21.113" cy="19.29" r=".2" />
                                <circle cx="21.341" cy="18.44" r=".2" />
                                <circle cx="21.341" cy="17.56" r=".2" />
                                <circle cx="21.113" cy="16.71" r=".2" />
                                <circle cx="20.674" cy="15.948" r=".2" />
                                <circle cx="20.052" cy="15.326" r=".2" />
                                <circle cx="19.29" cy="14.887" r=".2" />
                                <circle cx="18.44" cy="14.659" r=".2" />
                                <circle cx="18" cy="18" r=".9" />
                            </g>
                        </svg>
                        <!-- • <a href="">Source code</a> -->
                    </small>
                </footer>
                <!-- Footer END -->
            
            
                <!-- Script START -->
                <script async src="../static/share.js"></script>
                <script src="../static/minimal-theme-switcher.js"></script>
                <script src="../subscribe.js" type="module"></script>
                <script src="../blog_js.js" type="module"></script>
                <!-- Script END -->
            
            </html>
            
            `  //HTML build END

            let writePath = "./HTML/" + htmlFileName;
            fs.writeFile(writePath, HTMLbody, (err)=>{
                if(err) throw err;

                // UPDATE SQL
                let sqlQ = `UPDATE topics SET isHTMLcreated = 1,HTMLname = '${htmlFileName}', dateCreated = '${moment().format('MMMM Do YYYY')}' WHERE id = '${rows[i]['id']}'`;
                con.query(sqlQ, function (err, rows, fields) {
                    if (err) throw err
                    else{
                        socketIo.emit('trigger',"DB Updated")
                    }
                });

                setTimeout(() => {
                    let dest1 = 'E:/Development/eduwisecafe/blog/'
                    let dest2 = 'E:/Development/eduwisecafe/prod/blog/'
                    fs.copyFile(writePath, dest1+htmlFileName, err=>{
                        if(err) throw err;
                    })
                    fs.copyFile(writePath, dest2+htmlFileName, err=>{
                        if(err) throw err;
                    })

                    socketIo.emit('--countCHATGPT--', i)
                    if(i==sizeofDB-1){
                        socketIo.emit('--ENABLE-BTN--', 'TRUE')
                    }

                }, 1000);
            })



        }) //readfile End

    }   //for loop end

}

function buildTagsJSON(){
    let sqlQ = `SELECT * from topics WHERE isTextcreated = 1 AND isImageCreated = 1 AND isImageCompressed = 1 AND isHTMLcreated = 1`
    con.query(sqlQ, async function (err, rows, fields) {

        socketIo.emit('trigger', 'Building Tags .....')
        

        let tags = {};
        for(let i=0; i<rows.length; i++){
            if(!tags[rows[i]['topic']]){
                tags[rows[i]['topic']] = {};
                tags[rows[i]['topic']][rows[i]['subtopic']] = 1;
            }else{
                if(tags[rows[i]['topic']][rows[i]['subtopic']]){
                    tags[rows[i]['topic']][rows[i]['subtopic']] += 1;
                }else{
                    tags[rows[i]['topic']][rows[i]['subtopic']] = 1;
                }
            }
        }

        fs.writeFile("./TagsJSON.json", JSON.stringify(tags), 'utf-8', (err)=>{
            if(err) throw err;
            // socketIo.emit('trigger', 'Building Tags DONE ✅')

                let dest1 = 'E:/Development/eduwisecafe/prod/static/TagsJSON.json'
                let dest2 = 'E:/Development/eduwisecafe/static/TagsJSON.json'
                fs.copyFile("./TagsJSON.json", dest1, (err)=>{
                    if(err) throw err;
                })
                fs.copyFile("./TagsJSON.json", dest2, (err)=>{
                    if(err) throw err;
                })

                socketIo.emit('trigger', 'Building Tags DONE ✅')


        })

    });
}


function buildSitemap(){

    let sqlQ = `SELECT * from topics WHERE isTextcreated = 1 AND isImageCreated = 1 AND isImageCompressed = 1 AND isHTMLcreated = 1`
    con.query(sqlQ, async function (err, rows, fields) {
        if(err) throw err;
    
        socketIo.emit('trigger', 'Building Sitemap .....')

        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
            <urlset
                xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
                    http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

            <url>
                <loc>https://eduwisecafe.web.app/</loc>
                <lastmod>2023-01-24T11:29:15+00:00</lastmod>
                <priority>1.00</priority>
            </url>
        `;

        let topic = {};

        for(let i=0; i<rows.length; i++){
            if(!topic[rows[i]['subtopic']]){
                topic[rows[i]['subtopic']] = 1
            }


            sitemap += `<url>
                <loc>https://eduwisecafe.web.app/blog/${rows[i]['HTMLname']}</loc>
                <lastmod>${moment(""+rows[i]['dateCreated'], 'MMMM Do YYYY').format()}</lastmod>
                <priority>1.00</priority>
            </url>
            
            `;
        }

        Object.keys(topic).forEach(d=>{
            sitemap += `<url>
                <loc>https://eduwisecafe.web.app/topic.html?topic=${d}</loc>
                <lastmod>${moment().format()}</lastmod>
                <priority>1.00</priority>
            </url>
            
            `;
        })

        sitemap += `</urlset>`

        fs.writeFile('./sitemap.xml', sitemap, (err)=>{
            if(err)throw err;

            console.log('domeee')

            let dest1 = 'E:/Development/eduwisecafe/prod/sitemap.xml'
            let dest2 = 'E:/Development/eduwisecafe/sitemap.xml'
            fs.copyFile("./sitemap.xml", dest1, (err)=>{
                if(err) throw err;
            })
            fs.copyFile("./sitemap.xml", dest2, (err)=>{
                if(err) throw err;
            })


            socketIo.emit('trigger', 'Building Sitemap DONE ✅')
            socketIo.emit('--ENABLE-BTN--', 'TRUE')



        })
    }); 

}

export {
    getDataForBuildHTML
};