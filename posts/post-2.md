# Solutions


### Flag 0

- We are presented at a page with different links that take us to different subdomains

- Playing around shows us that the urls ends with **/page/number** such as:

   ![Screenshot 2021-11-14 at 10 24 59](https://user-images.githubusercontent.com/74051842/141675417-128e5464-aa7d-460c-b35c-4f1c7a0d63bc.png)

- tampering with the number in the url gives us some 404 pages, but for **/page/6** a Forbidden-page is presented:


   ![Screenshot 2021-11-14 at 10 42 49](https://user-images.githubusercontent.com/74051842/141675787-25e64ccf-5d04-4f6f-94d1-6af273903d1d.png)

- This means the page exists (whereas 404-pages dont) but we do not have access to it 
- Pressing the **Edit this page** takes us to a new page where the url still ends with a page number:
![Screenshot 2021-11-15 at 22 40 10](https://user-images.githubusercontent.com/74051842/141857735-7ec813b1-4859-4320-af0d-aeb159cba830.png)
- so what if we change the link to end with number 6?

![Screenshot 2021-11-15 at 22 43 22](https://user-images.githubusercontent.com/74051842/141858084-e4bf25ca-b402-401d-8590-1476039cf3ec.png)

**Giddy up!**


### Flag 1

- since page ID:s are used SQL injections might work
- adding a ' to the url: **5dc93c6eb8/page/edit/6'**

**And we get the flag**

- this time it only worked for the edit pages so bear that in mind

### Flag 2

- since we can edit pages on this website cross site scripting might exist
- enter an alert script into the textbox such as: **<script>alert`Dude`</script>**
- entering this into the title-text box the flag is returned

**yeah buddy**


### Flag 3

- a button is presented on page 2
- editing the page returns the following: **<button>Some button</button>**
- the page also states that scipts are disabled (in order to prevent xss)
- but the tag <script> is not filtered if within the <button> tags

   
we enter the following:
   
       <button onclick="alert('I am the walrus')">Some button</button>
   
- pressing the button will now trigger an alert
- viewing the source returns the flag

# Takeaways

### Flag 0

- if you cant view a page, maybe you can edit it

### Flag 1

- try for SQLi when ID:s are used
- if it doesnt work for one page, try it again

### Flag 2

- if there are fields where we can edit stuff, try out XSS stuff
- try for every field

### Flag 3
   
- if scripts are filtered out you can still get an xss somehow
