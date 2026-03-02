# Mandalore, Engineering Refinement - Feb, 23

# Transcript
**Wesley Donaldson | 00:06**
Fancy meeting you here. Good, Sal. So normally this meeting contains a lot of, a much larger team, including Rave, as an example, including the product team. We may give a moment of pause, or maybe even just have the product team stay on just as a chance to review the work. 
Good afternoon, everyone. Just give us a couple of minutes to see who else is able to join. 
See if Jennifer can DRW. 
Just in time, Harry. Okay, folks, thanks everyone for attending this session is going to be a little bit different than when we normally run. 
I'll let folks determine if they need to or want to stay based on that. Our intention for this session, rather than having product present upcoming epics or work for us to tackle is we want to use this as a level set, an opportunity to level set across the Mandor team around the commerce initiatives. Specifically, we're looking to understand where we are across all of the various epics and trueing up our current activity relative to Jira but more importantly, making sure that if there is work that's in process, getting clarity, if it's like truly done or is it is using mock data, is it not fully implemented, is it missing. Design. 
So we're going to do a walk through of the experience. You'all is gonna lead a walk through of the experience, and then we'll pause in each page and just have the engineers speak to where we are. Their participation on that page does that makes sense to everyone? Does anyone have any concerns, any content that you'd like us to cover as part of this session?

**Speaker 2 | 03:05**
How good?

**Wesley Donaldson | 03:07**
All right, you as let's jump in. If I can ask you to present.

**Speaker 2 | 03:11**
Sure. Let me share my scream. Okay, here we have DE Designs.

**Wesley Donaldson | 03:22**
Sorry, hold on one moment. Make sure I need to record this right? Go ahead.

**Speaker 2 | 03:31**
Okay, here we have the Designs and the implementation and the code as well, if needed. So what we want to validate is what is actually done, who is working on what, everything that Wesley mentioned. 
So this is the first screen that you can get to. That screen. Uhh. Through, usually through a zip code like this, because I what happened here?

**Wesley Donaldson | 04:02**
C sorry, could you use the sandbox? So. Lifelines. Lifelines. Sandbox.com.

**Speaker 2 | 04:10**
Okay, yeah, I was in the room.

**Wesley Donaldson | 04:17**
Hey.

**Speaker 2 | 04:18**
Okay, let me see. So just to give you some context, the idea is like we are going to redo. This is something else we were talking about. Wesley. We're gonna redo this page here in lifeline screening. 
And that's gonna be the entry page for our application. So this thing here doesn't matter because we are not using this. We are driving the user directly to appointment. And when the user hits this button here, it's gonna go get back into the life live screening. 
So right now when you select something here, it's gonna open the step one as well. And it's going to provide a citgo in the URL. That's what we are using here. If you come here with the st goal, it's gonna open up by the faul and load appointments in this page. Jeremy was working today. Friday on Friday. 
And today, on this map that is now fully functional, you can open it in and select the location directly here. And then you can view the times and it's gonna highlight the section with the different times. 
So you can select a time here. There is the opportunity to refine this search. Something that is missing in this p in this page is like this section of the mt. When the user is not gained results, we need to have the those three different screens with information about the locations that are nearby and things like that. This is missing. Wesley so it's something that we need to implement. 
And I think that is Jeremy, maybe Jeremy, you can talk about what's your next tick of the map and what you are doing in this page. Sorry, Nick, I am always, sorry, I'm just confused, but yeah, it's snake s naky.

**Speaker 3 | 06:32**
That's all right, I can be Jeremy today. Yeah, my next ticket is to the navbarn footer. This is I believe this is merged in right.

**Speaker 2 | 06:51**
The n bar and foer, but do we need the na bar? I think we don't noer need enough bar. It's like just what we have now. Maybe refine it a little bit, but the Nafar was something that we wanted before, but we don't want now.

**Wesley Donaldson | 07:00**
The callnap.

**Speaker 2 | 07:10**
It's this one because we are using the as.

**Speaker 4 | 07:15**
Do you still need the lifeline screening logo?

**Speaker 2 | 07:21**
Yes, exactly, but not the menu is for the min.

**Speaker 4 | 07:28**
Got it. Yeah, the hamburger menu I don't think we're using right now.

**Speaker 2 | 07:33**
Yeah, and the footer is here, but we need to do some tweaks to the footer to make a Worldwide Designs, and I think Greg was gonna add the footer for Desktop, but, is crack here? No. Okay, but we still need the design for the Desktop. 
But that's very easy to do. I think for the appointment page, there are other areas that are very important. For example, the. I think you fixed the phone size as well. Nick, yeah. Okay, so you already did the work. 
So maybe this thing here is important and it's like meaningful in my opinion because this is useful for the users.

**Wesley Donaldson | 08:26**
So we already have the line for that you all this is it.

**Speaker 2 | 08:27**
The.

**Wesley Donaldson | 08:31**
Jeremy or Lance which forgive me, which one you guys worked on the error messaging here. Jeremy, I know you're not still there. Last, you know, sorry, the original work.

**Speaker 2 | 08:40**
Snake Gay.

**Wesley Donaldson | 08:42**
So Nick did the design work, integrated the design, but the original functionality had this messaging already being rendered.

**Speaker 5 | 08:52**
Yeah, I did some work back predesign on some of this messaging. So if it hasn't changed from what we did then the graph and services should in theory already support some of this, but there were some modifications to the logic. 
So, like, we're not automatically showing screenings now if they're outside of their range. Like, there were some tweaks to how we were handling these extra events.

**Wesley Donaldson | 09:29**
Okay, right, let's sorry, let me summarize here.

**Speaker 5 | 09:31**
Yeah, two.

**Wesley Donaldson | 09:33**
So we need to create tickets to address this visual this presentation and the business rules to make sure they're still aligned to our product needs. 
That's what's outstanding on this page. Anything else outstanding on this page.

**Speaker 2 | 09:49**
I see. We have the menu here now with the three. The hamburger.

**Wesley Donaldson | 09:56**
It's fine like that.

**Speaker 3 | 09:57**
That wasn't changed, I'm not sure.

**Wesley Donaldson | 09:57**
We need to remove. Okay, so on the appointment listing page, we need to remove the hamburger menu, keep going and the pho.

**Speaker 2 | 10:03**
Okay, and the and we need to work on the footer.

**Wesley Donaldson | 10:13**
Okay, is there anything else missing on this page?

**Speaker 2 | 10:13**
Yeah, and yeah, I would say the UI here.

**Wesley Donaldson | 10:17**
From a functional perspective.

**Speaker 2 | 10:22**
I don't like this to be separated the mile from three, but cosmetic.

**Wesley Donaldson | 10:28**
I would say that's cosmetic.

**Speaker 2 | 10:29**
Yeah.

**Wesley Donaldson | 10:30**
We should. We should start creating a running list, but that definitely take.

**Speaker 2 | 10:33**
Yeah. Yeah. It's like that. We need the list of the cosmetic tweaks that we want to do. 
But just that's very straightforward and yeah, it's not critical.

**Wesley Donaldson | 10:43**
I would have a look like.

**Speaker 2 | 10:43**
This is for the first step. Then when you select a time you can reserve, this reserve is using the lock endpoint. I don't know what's that lock appointment going, to be honest, but yeah, it's a mutation.

**Wesley Donaldson | 11:05**
Okay, hold on, I answer that question.

**Speaker 5 | 11:05**
Is making a call to our gateway and locking the appointment.

**Wesley Donaldson | 11:10**
Go ahead. Lens. Sorry.

**Speaker 5 | 11:12**
I was just saying. That's making a call to our gateway. And that's actually locking the appointment. And see star for 15 minutes.

**Speaker 2 | 11:21**
Yeah, and what happened is I go back to the first step. Okay, now it's no gray I need to this is something we need to improve way system navigation. You I really got that one. You told me that you got it or you wanted to point it out.

**Wesley Donaldson | 11:39**
Yeah. The modification should pass back the previously selected parameters and basically the experience from the address that you previously provided.

**Speaker 2 | 11:50**
Exactly. And even if you click here, this is clickable. So you can click appointment. And it should take du to the appointment page, but with everything pre selected.

**Wesley Donaldson | 12:01**
Okay.

**Speaker 2 | 12:01**
The appointment that you selected before, for example, is this one.

**Wesley Donaldson | 12:01**
So.

**Speaker 2 | 12:05**
If I get back to the appointment page, I click here or modify. I think it should be different. If you click here, it should just take you to the this page, but you should see the time and everything that you selected before the user.

**Wesley Donaldson | 12:21**
I would encourage us not to add business rules like the unless product explicitly tells us that we need to add that because the original rule was just the modify brought us back to the page preloaded with the information is S1.

**Speaker 2 | 12:35**
Yeah, that's what I mean. We need the FA preloaded with the information. Sorry. Yeah.

**Speaker 4 | 12:41**
Yeah, it should follow the same. We just didn't have a specific task for that stepper at the top, so we may just need a task for that and the behavior around it.

**Speaker 2 | 12:55**
Yeah, but what I say is, this is working. And if we make this work, this is gonna work as well. So we probably don't need to worry too much about this. Just make sure that it's working. But the business logic is the same. 
It's like I select. But my question is. If I select here, for example. 1025. And then I go to reserve and then I get back or whatever. What's gonna happen with the 10:25?

**Wesley Donaldson | 13:26**
It gets cleared out of the system after an a default expiration date. We don't have to worry about that.

**Speaker 2 | 13:33**
Yeah, and that's what I mean. If I am the user who selected TED 10:25, I should be able to change and that's a feature functionality.

**Wesley Donaldson | 13:35**
Five.

**Speaker 2 | 13:41**
Just thinking a lou and unlock the time because I am the one who locked the time. 
But they're not getting into the weeds.

**Speaker 5 | 13:50**
But if they go back to the page in that manner, should we do another search automatically or just reload what was already searched? M because in that case it should still be there.

**Speaker 2 | 14:03**
Exactly. If I for example, no, I want to maintain the same time I can't and that's an issue.

**Speaker 6 | 14:11**
We'll do another search automatically.

**Speaker 4 | 14:15**
We can table that question right now. I'm okay with it. Not populating when you go back, it just gets really hairy when you start talking about, like, should we store the time? Should we not? Because at any point, someone could schedule from a different area. 
And if we're storing it for fifteen minutes, that's a fifteen minute window where any of those appointments could have been selected.

**Speaker 2 | 14:48**
Yeah, but my. The point is, if I select this time, I go to the next step. And then I came back just to see what's the appointment thing that we have here. I don't know why I cannot maintain that time, you know?

**Wesley Donaldson | 15:04**
It's because it's the same account, same person.

**Speaker 4 | 15:05**
I see. We're ta.

**Wesley Donaldson | 15:07**
It's not a it's not an issue of you and I are trying to schedule and picking at the same time. 
It's just you selecting the time. And then you lost the ability to select the time that you just had.

**Speaker 4 | 15:19**
Yeah.

**Speaker 6 | 15:25**
I was just about to explain that the requirement is we remove the time because it's already selected. You want to show only available time. And if we want to remind the user which time he selected the originally that was on the next page, you can always easily see it there. 
And yes, if we go back to this page, we always do a new search because we need the most current times. As Beth pointed out, if somebody made a selection for another time that could have disappeared. A fresh search will give us the latest times.

**Wesley Donaldson | 15:57**
Can I propose we flagged this as a bug and we read like this is.

**Speaker 6 | 15:57**
Thank you.

**Wesley Donaldson | 16:01**
I think Beth, my opinion here is we have enough to show happy path, but this is something that probably would need to resolve before it goes to the live customer. Bas.

**Speaker 4 | 16:11**
Yeah, we'll take that down as a scenario and figure out what we should do.

**Speaker 2 | 16:19**
Me put Arana because a lot of you are from Arana. Okay, second step. TH those packages are coming from the API. That's great. So the information that you see here is coming from the API and list packages and you can expand and you will see those little codes that we add in the API we need to map those into actual, text for the users and the membership. 
I think we are not we don't have the membership coming from the API and that's an issue that we have now that we need to it's a something that we need to work on.

**Speaker 4 | 17:05**
I think that work item just hasn't been picked up yet. It's there. It's scoped. As far as adding the membership to cart and what should happen when you do that?

**Speaker 2 | 17:16**
I need you to confirm an Antonio or mica. Is this mog data or is real data? It is real data. 
Okay, and was your concern and a bed. I don't get it, I didn't get her.

**Speaker 4 | 17:44**
I was just saying that membership isn't hooked up yet just because that work item hasn't been picked up yet.

**Speaker 2 | 17:49**
Okay, so just to say that web this is not done. We need someone to work on this, I guess. 
And next step is review. For review, we're pulling some data. But let me ask you.

**Speaker 5 | 18:06**
Some clarification on the last page of that. Like some of the stuff is hooked up. Not all the dollar amounts are correct. I think the membership might be real, but right now we're getting multiple memberships back and we need to kind of identify which is the correct one to show you. 
So it's kind of like, Cap, some of the stuff is there, some of this stuff is not. That's what it's got to be flushed out on this page.

**Wesley Donaldson | 18:31**
So I want to get to that list in this meeting, right? So let's use the time now to do that. So we're saying that this is being hydrated from the API scroll down, please. The online membership, the one line one Life membership is being hydrated, but there's multiple data elements coming back that represent this. Is that what you're saying?

**Speaker 4 | 18:51**
That is something we need to talk about because there will be multiple membership plans inside of there and you guys need to know which one to display here. So if it's a naming convention that you need me to use or however we want to do that in configuring the plan, if that's where it needs to st let me know.

**Speaker 5 | 19:07**
It's at the bottom of this plans.

**Wesley Donaldson | 19:08**
Get in plans.

**Speaker 2 | 19:14**
Let me get back to e okay, we have like new plan adorns men's women's health.

**Wesley Donaldson | 19:16**
Hide that? Yeah. Collapse that list. Stas.

**Speaker 2 | 19:32**
So we have multiple plants and we need one. Is that the thing.

**Speaker 4 | 19:38**
And that is a real case scenario when we move into production. So we're going to have our legacy plans inside of her Curly, and then we're going to have the plan that we are selling going forward. So from a technical perspective, we just need guidance on how are you determining which membership plan is being displayed?

**Speaker 2 | 19:59**
ALR so there's work to do here. Wesley is the conclusion.

**Wesley Donaldson | 20:07**
Okay, so it sounds like the only work here is just adding the coming to an agreement on how we want to denote and then having making the update in the logic to use that new flag of what the. 
I mean, the plan identifies that the simplest fixed. Let's have a configuration value that says here is the live plan ID. I mean, the preference would be if there's a way to actually return the data into, like, live plans versus legacy plans, that where we only have one object, we don't have to have a secondary place for storing an identifier.

**Speaker 2 | 20:50**
Yeah, I think that we just need to configure only one plan on record as well just to make it.

**Speaker 4 | 20:57**
There will be multiple plans in production.

**Speaker 2 | 21:01**
Or at least in the GRAPHQL API in the backend. We can't just you return to the client side. The plan the thing that Mars you know.

**Speaker 7 | 21:14**
Let's put this on the list for our next recurrly integration call. Again, I'm just doing a quick search. There appears to be a plan status because you can have plans that are still rebuilding people but are interactive for sale. 
So I'm guessing there's probably a way to get the data back from the back end if we can configure this properly. So let's ask recurrly because in that the memberships that we're importing into that we aren't selling like monthlies, then they'd be in and hopefully just as inactive.

**Wesley Donaldson | 21:38**
23.

**Speaker 4 | 21:48**
Yeah.

**Speaker 7 | 21:49**
Okay.

**Speaker 2 | 21:50**
Let's ask this is a detail go ahead.

**Wesley Donaldson | 21:57**
There was one addition. Actually. I'll wait till we get to the review page.

**Speaker 2 | 22:03**
Yeah, another detail I noted here is to consider later we is the with the design is like we need to make sure that we have the space here for the order.

**Wesley Donaldson | 22:15**
The foter.

**Speaker 2 | 22:17**
Yeah, okay, review I confirm this is other thing, I think the information in this page is mocked, everything is smocked, that's what I see in the call, but maybe just could you confirm with me?

**Speaker 6 | 22:36**
So when I did it. It wasn't mocked. I was fetching it from the endpoints that we hold it.

**Speaker 2 | 22:47**
Yeah, it's like.

**Speaker 6 | 22:49**
But I know we've been rapidly changing it the last.

**Speaker 2 | 22:53**
Couple of days. This is what I mean the this more diagnostic option. What are what is this.

**Speaker 6 | 23:00**
Just this obviously a mock is it says.

**Speaker 2 | 23:03**
Yeah, but is this what we are using here again?

**Speaker 6 | 23:09**
I have to double check on that before I can answer you. But I did see the data coming from. Michel's Endpoint. If that's not the case anymore, I can certainly help you to update, but that's not about the design at this point. We're talking about the design, right?

**Speaker 5 | 23:26**
It matches what's inside of the criban.

**Speaker 2 | 23:32**
Okay no, I understand I was reviewing today apr and it was using mog this mog as well. I say well why we still using this?

**Speaker 6 | 23:41**
Okay apologize if that's the case I want it.

**Speaker 2 | 23:45**
No.

**Speaker 8 | 23:46**
What you. I think what you're currently seeing in the screen comes from recuurly because we have the product catalog with packages and plans, so that's already wired up to the record a sandbox. Of course, it's not the case for prod because we don't have the config yet we don't even have the API key. 
But this should come from recording and I think that data matches. So for this particular endpoint. So product catalog. You should see the mock data only in your local environment, and since you're currently on sandbox, this should be coming from recordly. 
And I'm pretty much sure that that's the data that's configured in the recury sandbox.

**Wesley Donaldson | 24:23**
Can you open the package? You all this that we should be able to look at that inside of the response object.

**Speaker 2 | 24:32**
That's awesome. I didn't know that. I just. I just was reviewing and saw. I saw the mock and I thought that was the thing that we were using, but yeah, that's great. Everything is screening off. Okay, this is coming from. I don't know why this one is not there. 
It's probably because it's a duplicated diagnostic, but I.

**Wesley Donaldson | 24:55**
In the diagnostic right there down one down a little yeah there.

**Speaker 2 | 25:07**
Is this.

**Speaker 8 | 25:08**
I think the easiest way to double check would be to copy that. Description. That long one that you have. For example. Includes heart or something. And just do search everywhere in web store or vs code whatever you use. 
And if it doesn't appear in the local code base, it means that it comes from reculy because it's not configured as a mock.

**Speaker 2 | 25:29**
This one you mean? Okay.

**Speaker 8 | 25:31**
For example, like copy one line every screening or something, do search everywhere, and if it doesn't appear anywhere, it means it comes from recurring.

**Speaker 2 | 25:40**
This is what I mean. Individual test mock.

**Wesley Donaldson | 25:45**
Okay, let's flag that is an issue and let's move on. We need to circle back around and there may be mocked data being used on this page.

**Speaker 2 | 25:53**
Yeah. I am pretty confident that this is Mobil. You can let me know if I'm wrong. Other than that, the everything else here is same thing. Place order. So in the place order, now is Jeremy, now is you.

**Wesley Donaldson | 26:10**
3.

**Speaker 6 | 26:13**
One thing to note just on the previous page please, before we go to so on the review page.

**Wesley Donaldson | 26:14**
Can we go.

**Speaker 6 | 26:19**
My next ticket, my next epic is adding that location message, which should be here below the individual tests that stick at 569. 
And I don't have the design for that. At least I haven't seen it.

**Speaker 4 | 26:36**
It to location? Yeah, it is in the updated Figma, but I will send you to the correct page you're talking about the one where it says we have limited tests available at this location. Yes, I will get that for you.

**Speaker 6 | 26:51**
Okay, thank you very much. That's very much. Appreciate.

**Speaker 2 | 26:59**
Alright, and so the.

**Wesley Donaldson | 27:00**
Can you hold on one the membership like we were just discussing if it's pulling, which plan information is pulling.

**Speaker 2 | 27:02**
Okay.

**Wesley Donaldson | 27:09**
Can we just confirm? Think Dane, I believe this one was your page. Can you just confirm if it's coming from. Live data or not?

**Speaker 9 | 27:21**
Yeah, I can take a look, but, I guess on that note, while we're talking about this, the card footer there at the bottom as you add those add ons. I have a PR coming up soon here that will actually list them out as you add them to that photo there. 
So it's not just the total data.

**Speaker 2 | 27:39**
It's listed on the Desktop but not on Mobile. Yeah, correct. All right, please order. So here is Jeremy. Jeremy let me know what's your status for this.

**Speaker 5 | 28:00**
I think Jeremy is still.

**Speaker 2 | 28:03**
I still here Commission okay, never mind. I think Jeremy my understand is working on this page. He already did the initial visitor's information, the staff with the validation, but he's integrating with this page and going is going to be adding the building information, but that's my understanding. 
And Lens is working on the complete portions right.

**Wesley Donaldson | 28:29**
That.

**Speaker 5 | 28:35**
The back end of it.

**Speaker 2 | 28:39**
So after we are done with this page, any other questions whether up eone anyone else for this page.

**Wesley Donaldson | 28:47**
The hoon the a houpon. CI think Beth, I think I saw one ticket. You had a comment that we'd removed discounting or something to that effect.

**Speaker 4 | 28:56**
It will be a separate scope so that we can just do like full happy path and then we will come back and apply discounts on top of that.

**Speaker 2 | 29:06**
Yeah, we can just remove this line from the goal and, yeah, that's it.

**Speaker 4 | 29:10**
It can stay there. It just isn't functional right now.

**Speaker 2 | 29:13**
No, because, you know, just to.

**Speaker 4 | 29:16**
It'll be coming up, like next week, so I wouldn't do the extra work to remove it when we have to add it back in immediately.

**Speaker 2 | 29:25**
All right, sounds good. There are some things that are not working, like clicking this. I would say we don't need to add tickets for every small ward because this could be combined with the other rest of the page very easily. Just clicking here and expanding the terms on. Yeah.

**Wesley Donaldson | 29:45**
Before we say that, like, Beth, do we have anywhere else? We're using the terms and conditions.

**Speaker 2 | 29:53**
I saw that here. Right?

**Wesley Donaldson | 29:56**
Or we can make it one.

**Speaker 4 | 29:57**
That linked view terms and conditions would just take them to our legacy Terms and Conditions page. So if you go to lifelinescreening.com, there is already a page for terms and conditions. It would just redirect there. The terms and conditions that are inside of checkout are the acceptance that we have to track. 
So the terms and conditions I jumped ahead to actually place an order in our curle. So I have to circle back around and scope that story back out. But basically, terms and conditions have to be a requirement for placing the order, and their acceptance has to be associated with the appointment information. 
So we have to be able to audit on terms and conditions acceptance.

**Wesley Donaldson | 30:40**
Do you need it to be in line meaning in the page, or is it okay for it to be a new window open? Is it the same? Is it the same location or the same data? 
And if it's not, I.

**Speaker 4 | 30:51**
The design is there. So if you go to checkout the one that on the side this is check out use this one.

**Speaker 2 | 30:57**
Okay, yeah, I remember I saw that. Yeah, it's here it's like just copy based in this test and does it's my understanding. So I what I say is we can just do this with the. With whoever is working on Jeremy. The sticket is like one may not. I don't know.

**Speaker 7 | 31:18**
Beth, is this window. This is the same as the terms and conditions on the home page of the main site, right?

**Speaker 4 | 31:25**
I don't know. I haven't actually reviewed theext that they put here in the mockup. I would assume that's where they grabbed it from.

**Speaker 7 | 31:35**
Okay, ideally, yeah. And this is just an overlay that pulls the content from that same URL for the team. Because we kind of want to avoid having to. And unless this is new and different and unique to check out, we want to just be able to have one terms and conditions so we don't have to remember to edit it in multiple places.

**Speaker 4 | 31:57**
Can we pauseit for now those days because I think we're going to be moving those pages.

**Speaker 7 | 32:03**
They to stand WORDPRESS because they have to be dynamically editable without a release.

**Speaker 4 | 32:07**
Okay.

**Wesley Donaldson | 32:12**
So hold on.

**Speaker 2 | 32:13**
So then we need okay.

**Wesley Donaldson | 32:16**
We didn't come to can. Just for the sake of moving this along, can we just use the text that's in the Figma and we'll create a ticket for actually making it dynamic?

**Speaker 4 | 32:27**
That's totally fine. I just haven't reviewed this or refined the story yet because I moved ahead to the API integration with Curly so we could have that conversation this week. So this isn't even ready to talk about yet.

**Wesley Donaldson | 32:37**
Perfect.

**Speaker 2 | 32:38**
Okay, so we can hold this for later, is what you mean? We don't need to include this.

**Speaker 4 | 32:46**
So I don't need to have it to get for that yet. So that's why there's so many questions.

**Speaker 2 | 32:51**
Alright, so then complete purchase and Lence is working on this discovery for this gathering all the data, all the everything we need. And then you get into the last page, we have the song UI for this page, we need some refinement like changing the phone size and a few other details, but it's pretty much here. 
So we just need to make this work with the data that is actually coming from either the API like the order number and everything here, or from the LO session storage. Something I wanted to add is when we get to this step, I think we need to remove the data from session storage just because we don't want the user just to go back and see the same thing again and be able to hit this button, you know?

**Wesley Donaldson | 33:55**
Agreed.

**Speaker 2 | 33:59**
And that's pretty much its.

**Wesley Donaldson | 34:02**
Okay. Is any engineer on the call aware of any features that they're actively that they've already committed to that are already working on. That should have been part of up to this point like actually go back one sorry, can go back to display go back one right on the go back one more up to this point, the conversation around it is it mock or live? 
That's a perfect example. Are you aware of any engineer who's already contributed work here? Are aware of any functionality that's currently using mock data, not pushing to session storage, or anything along those lines that would have this page appear functional, but may only be functional from a visual perspective.

**Speaker 2 | 34:50**
I think this is mo I am 99% sure. But yeah, and the race is in the local storage.

**Wesley Donaldson | 34:55**
We'll solve that one. Don't worry about that one. That's. Anown.

**Speaker 2 | 35:03**
You can see it because we can refresh and it's there incess.

**Wesley Donaldson | 35:03**
I. 
He.

**Speaker 10 | 35:13**
He guys, we do consume the API in any cloud environment. The Marques only runs in local one like PNP and Delv. Otherwise it's consuming.

**Speaker 2 | 35:26**
The gateway, the Pi gateway. But I think we need to consume the real one for death as well. That way we can be sure that we are doing everything right.

**Speaker 8 | 35:41**
I just checked the code and the review page is indeed, consuming the MOC data. So if you open the rev page tsx there's an array. Individual tests. It has an array of diagnostics, and this array is hardcoded on the Revue page basically, so it doesn't come from the API but on the other hand, the product catalog comes from the API exciting.

**Speaker 2 | 36:06**
Yeah, that's what I say. It's like for pro Kadalo. I'm sure it's from the API, but this one is smock.

**Speaker 6 | 36:13**
That's working on that, yeah, no, so I'll be working on that next. Anyways. To add the location, think 1.2 epic. 
I'll add consumption for the diagnostics as well. 
I'm touching the same component barefot.

**Wesley Donaldson | 36:35**
So my next question or my next challenge is want to understand what the endor team. So Nick, Harry, Dane, what are you guys actively working on relative to like the commerce for Mandor? My read of this is nothing like Nick. You're cleaning up some stuff. You have some outstanding on the mobile presentation. 
But is there anything else the team is working on?

**Speaker 7 | 37:03**
Not that I'm aware of.

**Speaker 9 | 37:05**
I currently have quite a few assigned to me. Cart review displaying card info, cart review modification for editing, and then current review with membership. So I mean, I'll have some tiny PRs coming in and out. Hopefully some TE coordination with Jifcode here because we're mostly gonna be touching some of the same pages. 
But most of my tickets kind of revolve around just assessment of what's already built versus what's missing and then doing some of the tweaks that Yelvis has highlighted here. The very last card that I have is kind of set up a little bit more for the future for checkout and order summary. 
And I think in that one, as I get closer to it, we can kind of circle back on some of the outstanding features on that checkout page, like the terms of service to see if anyone has available band with a pick stuff up like that up.

**Wesley Donaldson | 38:05**
Did you? Okay, I think maybe Jennifer, Harry, myself and maybe Stace we can talk about it. It looks like we have a little bit of bat within me houses time as example. So there could be opportunity. 
If we want to free Updain.

**Speaker 2 | 38:27**
Yeah, I just wanted to ask the developers, about this. It's like when we didn't have design or UX like we have now. We have someone working on this. But now I have the feeling that it's better just to one person to own the review page instead of just splitting that because it's more overhead to coordinate and everything. 
And this is super related to this. It's not like we can't just do one without the other. We could, but it's lie. It's weird. You know? I feel like a developer working on this would be happy to just make sure this is updated, and it would probably will because it's just like a Sustan. 
So Sustan is going to take care of this. I won't say that. Then you got to continue to do it. What you' doing it but it's just like things like that. I just want to get your feedback.

**Speaker 9 | 39:24**
You know?

**Wesley Donaldson | 39:24**
Well, I.

**Speaker 9 | 39:24**
I agree. I think it would be easier, right? As far as, like, friction and running into a running into conflicts, right? If you're working on different pieces of the same page.

**Speaker 6 | 39:40**
That sounds good to me. I can switch to something else if you guys prefer to go that direction.

**Speaker 2 | 39:47**
No, I think the point is that you are going to own this.

**Wesley Donaldson | 39:51**
Yeah.

**Speaker 6 | 39:51**
That sounds good too. I can own it, no problem. Whichever you guys don' is that the direction? Just to confirm again.

**Speaker 2 | 40:10**
I feel like we are gonna we're giving context to Wesley so he will have now some minutes to accommodate everything else.

**Wesley Donaldson | 40:14**
Yes, yeah, let's take that offline. I think we're all leaning towards yes, but let's just let's take that off line.

**Speaker 4 | 40:23**
I was as I was in as to himself wants to fairly for other people from st.

**Wesley Donaldson | 40:25**
I want to get a sense of what the effort is for one engineer to own it and just clarify if that could. 
Still, it's small stuff like putting in some textual terms and condition, but I want to make sure we have enough time if one person owns it versus if we define a way to have two individuals contribute to it.

**Speaker 4 | 40:31**
Cla was as that someone could make that or super. So we.

**Wesley Donaldson | 40:41**
So let's take that offline. I'll circle back around with you all of this Jeffco, and we can make a decision from there.

**Speaker 4 | 40:49**
Are. Ya sure. Just give me one moment.

**Wesley Donaldson | 40:53**
2, is there anything else that we anyone else, any other engineers working on specific tasks that relate to everything up to review that we'd like to discuss?

**Speaker 4 | 40:56**
I.

**Wesley Donaldson | 41:07**
But again, big question is are you using MOC versus live data? Are you complete with the implementation of the UI experience and validation and are you using the current. Design. All of those look like they're yes within except for the unknown, but here's your chance to please raise your hand if there is something that you're aware of. 
Okay, that was the original goal of this session. We can use the time we have. Beth. If there's additional work product would like to share. Or anything you'd like to discuss. Or you'd like us to walk you through again?

**Speaker 4 | 41:49**
No. I just want we talked about all the little things that need to be adjusted. Like the UX, there are some things that don't line up just visually right. So like the buttons aren't the right size, they're stacked when they should be all in one line. Are those the things that will be kind of hand each person a single page to go in and make those tweaks?

**Wesley Donaldson | 42:15**
Yes. So looking for a QA effort.

**Speaker 4 | 42:17**
Okay.

**Wesley Donaldson | 42:18**
And I think who and that's kind of part of my question of who's the best person? Should we be working with the Designer or should we just. 
So I think your direction was we'd work with you to kind of get some of that. QA. Review. Obviously, we can work with, like, Debn myself to kind of do an initial pass and just develop earbugs.

**Speaker 4 | 42:37**
Yeah, I would say do it an initial pass because there's obvious stuff that if you look at the Figma, you can see the things that need to be adjusted. 
And then from there, once you guys are like, okay, I think we matched the Figma, then from there we can do a final kind of like QA validation to make sure that the interactions are what they should be.

**Wesley Donaldson | 42:58**
Okay, if it sounds like we're good on all the topics we need to cover. Jeffco. Dane. Jo. Elvis. If you can hold the line, please.

**Speaker 6 | 43:11**
Certainly I can hold a line.

**Wesley Donaldson | 43:19**
All right, everyone else, feel free to drop or feel free to stay on. Jeffco, sorry, you're all this. Can you open the review page again, please? 
Okay, so there's a small amount of work here. I think your offices. I align with your offices' perspective that this is probably we have to be very mindful of the cycles and the back and forth between team members. 
So Jeffco, I'm inclined to say yes, I think my only question to you here would be, Dane, if you have a perspective on how much effort you think is outstanding. And then Jeffco co hearing that the effort you think is outstanding to get the state validation to fix the actually it's on the previous page to get this to get the state validation done here. 
If that can all be accomplished within the next two days, two to three days, and it really should probably be the next three days because we need to leave ourselves enough time for just getting this built on and on the test environment.

**Speaker 6 | 44:26**
So state validation. What did you decide? We're going to validate it here on the pager on the backend. My recommendation would be on the weekend when it click Place order.

**Wesley Donaldson | 44:41**
2.

**Speaker 11 | 44:41**
Validation or display because we still need a display based on the state.

**Speaker 6 | 44:47**
Okay, can we're not talking about validation, okay? Displaying is on, so when you say display, we already have displaying. 
What else is needed to display?

**Wesley Donaldson | 44:57**
No, there should be a message there.

**Speaker 2 | 44:58**
WA we need to display first the real information from the backend.

**Wesley Donaldson | 44:59**
Sorry, go ahead.

**Speaker 6 | 45:07**
Yeah, let's not get carried away. Yes, we already have that. Yes, we're switching to bacon. That's cool.

**Speaker 2 | 45:13**
Yeah.

**Speaker 6 | 45:14**
What else needs to be displayed?

**Speaker 2 | 45:16**
In the mobile view, when you select an individual diagnostic, it should be here. I think that's what Dang was finishing.

**Speaker 6 | 45:28**
It's the mobile view, that's something. Okay, that makes sense.

**Wesley Donaldson | 45:35**
Let's. Dane, how far along are you with that work? You mentioned you had mi PRs. That implies that you have work in progress.

**Speaker 9 | 45:44**
Yeah, I mean, the bulk of the task assigned to me are around this review page, so I've gotten one through already earlier this morning. I have another one on the way that's go to handle the middle of you here. As far as the pulling of non MOC data. I can handle that as well. It won't take too long.

**Wesley Donaldson | 46:08**
I would ask that let's have Jifco because that's part of the core work he's doing. I would say, and you all just please jump in here. I would say let Dane finish what he's actively working on because there's cycles to actually hand that back and FFCO is currently working on something. 
So maybe we say let's use today to complete whatever you have in progress. Mostly speaking to you, Dane. And then we'll have a break where FFCO can own the review page going forward starting tomorrow.

**Speaker 2 | 46:36**
Yeah, for me what matters is ownership, and for me they can't finish this. But I think GCO should be responsible to making sure this page is complete and that everything is working. All the pieces are working together.

**Speaker 6 | 46:54**
I think that's exactly what Wesley said, and yes, that's what I understood as well. Just leaving Jane to finish his piece today.

**Wesley Donaldson | 47:03**
Okay, so that's the agreement there, and that solves the handoff between the two. So. But let's close that issue out.

**Speaker 2 | 47:13**
Do you have some clarity about the membership? Who is gonna deal with this? Or that's something that we want to plan next.

**Wesley Donaldson | 47:20**
That's something we want to plan next. This it's a minor thing, but it is technically an architectural consideration. Like this is a determination of is it going to live in recurrly, which is I think sounds like the preference. 
And I see why. Or is it going to live kind of like how we're doing the state validation as a resource file inside of the repo?

**Speaker 2 | 47:43**
I don't see how this will live in this. I think that this should be. Do you mean like presentation on the functionality?

**Wesley Donaldson | 47:53**
No function the functionality like this. This should be hydrated from based on the API call from MCCURLEY.

**Speaker 2 | 48:00**
Yeah, because definitely we need to in the checkout. At least we need to make sure we get the disconfigure incurring.

**Wesley Donaldson | 48:07**
So I think this is solved for let's I'll open a ticket for this, but Stas already mentioned that this is a conversation we want to bring to Rick Early. Jennifer familiar where when all of those meetings are and if we do we have Germany or Lance or you all this in one of those in those meetings.

**Speaker 11 | 48:27**
Yeah. You? Oasis.

**Wesley Donaldson | 48:30**
Okay, perfect. So maybe you all us will just like if I'm not sure how you're tracking the topic items, but if you could just share's make sure that's just one of the items that we're tracking. It sounds like the preference should be a mechanism for recurrly to show the active versus the inactive plans, or the future plans versus the current plan. 
And then we could just use that status of current or whatever the proper nomenclature is to show that.

**Speaker 11 | 49:05**
All right.

**Wesley Donaldson | 49:09**
Okay, what else do we have? We have some minor stuff around removing the hamburger. Like, I'll get small tickets for that. Unless you have some.

**Speaker 2 | 49:20**
Yeah, there are, small things like cosmetic like, you know, this the steeper is not 100% the same of the design. For example, this check icon here is different and this is more like you know detos but are not functionality are just cosmetic stuff. We can maybe compile a few of the cosmetic into one ticket if it makes sense. 
And we can make it world.

**Wesley Donaldson | 49:49**
I think I'd probably just a refinement epic, a visual refinement epic, and then I'll just create sub tickets underneath it. If they're small, it could just be like a checkboxes out of one ticket.

**Speaker 6 | 49:57**
Exactly.

**Wesley Donaldson | 50:02**
Devin, do you have any active work on your plate right now? I'm thinking maybe the two of us, or maybe Stefan can join in as well. 
I know he's more focused on the automation testing, the playwright testing stuff, but just as a way to kind of start sourcing some of these first pass visual. QA any conflict?

**Speaker 6 | 50:21**
Yeah, I can take a look.

**Wesley Donaldson | 50:25**
Any concern with that? Jennifer.

**Speaker 11 | 50:28**
Do we have people working on the Playwight test? Do we have enough?

**Wesley Donaldson | 50:33**
That's another topic for this conversation. Is Stefan het's not an invited genius? So maybe you're obvious you can speak to this probably better than anyone else on this call. We have a few things. I had a filter here. It looks like there's about seven items currently that are in progress or waiting to be picked up that is specific to playwright testing. 
So we have the skill that Jifco created, the AI skille that Jifco created and said and pushed him to the repo. I know you have a perspective on playwright and Stefan was contributing to that. I don't have clarity on what the final outcome of that kind of. Let's get together and come with a more effective plan. Can you speak to that?

**Speaker 2 | 51:29**
Are you asking me or just go.

**Wesley Donaldson | 51:31**
I'm asking you. Sorry, let me try this a different way. I have. I have a standing assumption that you've already taken a look at some of the playwright considerations and you've maybe partnered with Stefan to kind of figure out how can we holistically attack playwright. Is that.

**Speaker 2 | 51:47**
Yeah, I created, we already had some Playwight tests. I addted those like seven tests to match the new design, and I added a new a Happy Path test. I would say that is gonna go through all the steps and is going to, test the different scenarios. 
But I think we need to add more tests. And it's very easy with AI it's a super straightforward. And we can even let the I just present them on Friday. We can even let the I open playground, create a test, make sure everything is working, with the playgright, the selectors and everything with the real page and then adding the test is very straightforward, but we just need to make sure what we want to test, what makes sense to test. 
And that's pretty much it. But I can pay with the QA and I as I already assigned my the pre white tickets to him. And let me ask you something. To the developers, do you think we should test or to everyone here, do you think we should test with real data or with mock data or with both? What's your idea with a mark soda?

**Speaker 6 | 53:16**
So it depends what you are trying to achieve. Moke data provides the isolation. You know that the test will always run because it's independent from the real data. The real data can change. But if you're trying to do like some, smoke testing on production, et cetera, I think it should be real date for peer environment et cetera. I should say it's smokedate or SN testing.

**Speaker 11 | 53:37**
I really just want to have. Hey, does the app open up? Like kind of thing. Like not really needing real data for like. Like CA smoke tests should just be really quick and short.

**Speaker 2 | 53:53**
Yeah, no, I say because there are a few risks of smoking everything. I think like as you mentioned, having some smoke tests that are using the real APIIS would bring value as well, because that way you can make sure it something is having a different shape, it's bringing a different shape from the API we are just catching those issues. Or if the GRAPHQL is throwing an error. Or there are a lot of scenarios when using the real data adds a lot of value. 
But not all the tests will need the real data. But at least one or two smo. Small test could, leverage that there.

**Speaker 11 | 54:37**
I won't die on my hung.

**Wesley Donaldson | 54:40**
Yeah, I think my bigger concern is more is the playwright test a blocker for us considering a particular epic or feature to be completed? My preference, as a technologist would be. Playwright should be part of the delivery of a feature because the playwright proves the feature actually workstation of the feature actually works. We are currently in a situation now where much of our functionality, especially up to the review page, is complete, but we have outstanding playwright tests that we have not been complete. 
So it's the speed of execution around the playwright. Obviously the team could write playwright tests. Obviously they could. On with some enablement write using AI for the playwright test. I mean, my concern was if there was something you were doing from an approach perspective you, Elvis or something that you'd from a approach that you'd come up with, Stefan that would be relevant for the rest of the team. It sounds like you've done some testing. You've kind of done a happy path as you said, but nothing systemic that you're going to put forward for the team. 
So hearing that, I think what Jiffcook put forward is probably our best approach. And maybe you could pae with CO and just look at the AI scale that he documented and then the expert and then we just go for what you demoed on Friday, I believe was how to use that AI skill in actually writing playwright tests, is that correct?

**Speaker 6 | 56:03**
No, last Friday, we didn't have time for that. We focused on primarily on the reviews, but the skills in the RIP where everybody can access it. And I think he always has done a great job using it, writing these tests. 
And again, the skill is right there.

**Wesley Donaldson | 56:21**
Okay.

**Speaker 2 | 56:21**
It's like a skill is just like documentation. Wesley. It's documentation for the AI to make better decisions. Are writing the test.

**Speaker 8 | 56:31**
But.

**Wesley Donaldson | 56:32**
Yeah. Is that a true, quote unquote skill, which is like an actual and actual thing in Claude, it's just like a very detaed reb file that explains how the AI should run away. It fair? 
That is very fair. I think my problem here is we're still at a point where we're not actively writing those and they're becoming a blocker to us closing our tickets. So what I would propose. And Jennifer, please love your thoughts here. What I would propose is there's still value to doing them, but they cannot be a blocker to us getting the demo out. 
So what we did before was we moved them into an epic that was a fast follower to the completion. I think that's what we need to do here as well. And then engineers who have bandwidth. In theory, if DA was still staying with us, he would. Bandwidth to take on writing some playwright tests as he. 
Because he's going to be done with the review tweaks that he's doing today. So the next person that might be up for the original Mandor team, maybe me. How? You might be up for writing some playwright tests because your light on tasks since Germany and Lance and you, Elvis are taking on much of everything after review.

**Speaker 8 | 57:43**
I think, yeah.

**Speaker 2 | 57:45**
The point about the test question is like, as Gith mentioned, we can write like 20 tests for everything we want in five minutes. It's super simple with AI it's not like a blocker or anything. All the tests that you want, you can give me a list of tests. 
I will write the test in ten minutes. It's very straightforward.

**Wesley Donaldson | 58:07**
I don't disagree with you. Full transparency. I just. I would say from our past experience, we have we've not been able to do that. And maybe you're all this to your credit, you can do that rather quickly. 
I think I'm more concerned about making sure the team can do that going forward. So the AI scale in the demo that was planned for last Friday, the goal and hope for that would be to empower team members to be able to do that the way you're currently able to do it. You're all this. 
So I4 yeah, I agree.

**Speaker 2 | 58:33**
I think we with GI cane with g. And we can prepare like a demo on how to approach the test in a very simple way. So the test, so we can focus on application goal. And the tests are gonna be. Something that we can give it for granted. 
That is straightforward.

**Wesley Donaldson | 58:52**
So let's summarize this I'll create a new Epic. I'll hold all of the tickets. We will move forward with the rest of the review, the UI and integration functionality, and then we'll have that demo based on the peering session between you two, and then I YouTube will generate the test for us to close out that epic. Or we'll use it as an opportunity to have maybe Lance or Jeremy or whomever else pick up and follow you guys through and you guide them through how to generate these tests. Does that sound like a final decision on this?

**Speaker 2 | 59:26**
That makes sense.

**Wesley Donaldson | 59:28**
Okay, all right, guys. Apologies, I have to jump into another meeting, but thank you, guys so much. I sorry I didn't get a chance to say this, but I think it's important to acknowledge it. Great job in getting us to where we are like this. Integrating the design. 
I know your office. You took a lot of that onto your shoulder. So I really appreciate that. I really appreciate the entire team from the Endor jumping in to help us out here. So I think we have a checkout flow here. That means a fine iteration in the back. 
But everything I'm seeing says we have. We'll have a demo read a strong demo ready for sharing next week, so that isn't entirely thanks to you guys. So really, thank you so much for that effort.

**Speaker 2 | 01:00:11**
Right.

**Wesley Donaldson | 01:00:12**
Hi guys. We can close out here and we can circle back around.

