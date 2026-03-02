# AppDev Leads DSU - Feb, 24

# Transcript
**Harry | 00:02**
Events didn't happen for a few hours. 
The next one I need to look at is the stuff that we looked at doing in December around the Codino pool. So we need to deprecate the old one, pull out the code where we did the swaps, and we can start ripping out some of those lambas. We don't need any more specifically migration once we've got that stuff out. Or as I get that stuff out, I'll move everybody over who hasn't been.

**Stace | 00:38**
Migrated by the Lambda.

**Harry | 00:40**
And then we can add the functionality to ad users for when a collided e mail is changed on someone's account so that we can make sure everyone gets in there without extra steps. That's where Andor is. 
I think a couple of the guys have some work in the Mandalor report as well.

**Jennifer | 01:00**
Is the CLOUDWATCH thing. One thing that we have to worry about doing, like the scheduler. Sorry, is the scheduler not working? Something that we have to worry about. Missing messages.

**Harry | 01:15**
So the messages are in this queue, so I'm going to release this now. The I don't think it's something we have to worry about anything being missing once these go out because they should get processed. 
Okay? They don't. They'll end up back in this queue. If my understanding is correct. I'm not sure I just had this watch open. Must have changed a page. But yeah. It looks like in the time where we had the spike of these, a different window open. 
Yeah, we had this. And when I looked at the cloudwatch logs there, something happened where it was the land. It was just down maybe a DBS they I'm not really sure, but that's the spike. 
So these are the ones that need to get cleared from the 19th. Okay.

**Speaker 5 | 02:22**
Thank. Alright, just one quick note for Harry. For the issue where resell all results for the event, but I know you mentioned they couldn't find it. We add a few more email or participants, specifically those test users that they've provided to see if we can use those users to trace what happened that triggered those emails to them. 
I'll reach out to Nick as well, but just for Yambo.

**Jennifer | 02:53**
Okay? I sent him the users after he mentioned he couldn't follow through. I asked him to look at the participant stream. So, Harry, if he's not able to find it, hopefully we can figure that out earlier today and follow up and see what else we can look at.

**Harry | 03:11**
Okay?

**Jennifer | 03:13**
But there's got to be some reason why those got sent. And so we should be able to find something in the participant stream, I'm sure. 
WEST how about you guys?

**Wesley Donaldson | 03:36**
We're doing well, actually. Forgive me, I'm struggling. Withthwood is the best view to share with you guys, so let me just take a I'll start here. So overall, we've made really good progress in the. Again, my full compliments to the team last week and just Herculean effort and just getting us to a pretty robust checkout flow up to the review process. Even some visuals around the order placement. 
So that's the valid. The credit card information, billing information as well as a first stab at the order confirmation page. We are actively working on spikes necessary to take us from the review page all the way into pushing the order into recuurly and getting us to that full order confirmation with fully injected into recurly. 
So the team is working on that. There's a few spikes specifically that Lance is taking on to get to that point. No blockers specifically on our understanding of using recurrly. As I said, that Spike is working. Lance has recently committed a first pass at creating an API endpoint that can actually do the connection with Curly. 
I think I will leave it to Lanz and I my trust in Lance there. On like our approach there, I think we had discussed using recurrly JS so the separation of recurrly JS versus the use for need for making an API call pushing the order. 
And I think that's not clear to me just yet. But Lance and you all this is working on that and they feel confident of the current approach. As far as where we are generally, we've created from the conversation yesterday, we have a pretty detailed breakdown of all of the things that are outstanding from what you guys saw yesterday. We have a full checkout flow, but there are a lot of little nuances around the edge. 
For example, the review page had a few areas where we're using mock data. So we've captured all of that feedback. We've broken out individual tickets and targeted few team members that are already known. I'm hosting a session with the team again this early. As soon as I get through these couple the next hour or so, I'm going to host a session with the team, just to kind of assign out all of these known issues and get to full clarity that by the time we hit the review page, everything before it should be done. 
That's the goal of this epic, as well as to address some of the items that we pulled out. So I pulled out some of the playwright work as well as in the QA validation out of the individual epics. For example, we had made really good progress on the display of the order summary. 
So we didn't necessarily need to have AI pulled out the ticket just to reflect the fact that the feature was completed, but it was missing testing and it needed additional QA validation. So rather than having the epic look as if it's kind of stale or not moving effectively or we haven't completed the experience, I moved all of those out into this one epic to allow us to have fast following review fixes without kind of and still showing the progress that we've made on the actual like experience itself. In summary, overwhelmingly, I think we're at a really good place with the review. 
I think we're tracking well to have this kind of in a really good state by end of week. The spike will really inform if we can truly complete the order by this Friday, but I think projecting out. I see us probably moving into mid next week or early next week for actually being able to complete the order but let the spike drive that direction. 
But just from what I'm seeing currently, that's what I'm projecting out. These items here are what's known. These are all, as you, Els said yesterday in the review, these are all very manageable. These are not Herculean tasks that are outstanding. 
So I think we're in a really good place. My point.

**Jennifer | 07:24**
Okay. One thing that I keep hearing from everyone is just keeping with, like, those vertical slices to help things not conflict with each other. So when we're handing out these tasks, like making sure that they're like the like that any vertical slice, like the same person takes multiple tests just because they're saying that especially like with AI building, like generating any code. That way it leads to the least merge conflicts as possible.

**Wesley Donaldson | 07:54**
Yeah, you and as and I connected for a good hour, I think, yesterday. We're all in the city mind of that, so this is the first pass at that.

**Jennifer | 07:59**
Perfect.

**Wesley Donaldson | 08:01**
We already know that your all of us is going to kind of own some of that like getting us through past review. 
So I can use assigned to that already. Jeff co like raised his hand for review. He's assigned to that. I just need to kind of get to appointment and product selection. These are really kind of Lance and Jifco. 
But I don't want to give another ownership to Jifco. So we'll get to that clarity in our session in the next hour or so.

**Jennifer | 08:32**
Awesom thanks. Anything from anyone else? Beth, I know you have something to go over in the office hours today.

**Speaker 6 | 08:49**
Yes, it should be fairly straightforward. So it really is just disabling the complete purchase button until just the validation is met. So that seems pretty straightforward. I don't think we'll need to dive in from a full product refinement. 
So I'd like to review that one. And then this afternoon in product refinement, I want to talk about actually submitting the purchase and doing the validation aroundment and appointments and then what it looks like to insert the order into a curly, which is part of what you all of this and Lance have been digging into. I want to make sure we refine that this afternoon so you guys can go into architecture tomorrow. 
So that by the time we have our meeting with RI Curly on Thursday, we have our approach documented and they can poke holes in it.

**Wesley Donaldson | 09:46**
Nice. Beth, just to confirm, do you. Did you invite me to that session? Is that already on calendar?

**Speaker 6 | 09:55**
No. 
I can meet with you tomorrow because there may be some changes post refinement.

**Stace | 10:12**
And back on that. I don't know how literally you meant that. So if you meant validation of what's on the card in terms of the business logic we're applying client side, then placing the order and recurrly. 
I think that's on the plan. Validating, prevalidating and C star before placing the order on Reco. It's just not possible.

**Speaker 6 | 10:36**
No, it's Jap recurrly. So, yeah, like if we go to submit the order and the payment fails, then what are we doing? Yeah, we shouldn't be creating the order in recurry if the payment is not successful.

**Stace | 10:49**
Well, I don't think Recurror will like you.

**Speaker 6 | 10:52**
That's what I'm hoping, but it's in there. So yeah, none of the legacy validation is in there. I've pulled that all out for scope. The only thing that we'll do around that when we get to that point is just duplicate the error logging that we're doing in Shopify today so that if there is an insertion error into C Star, it's being logged and surface to our support team.

**Stace | 11:14**
Yeah, it's a good idea actually. I take that back. That's we should ask recurrly there probably will be a representation just like and shop fire right that someone tried to place an order and it failed and here's why it failed.

**Speaker 6 | 11:28**
Yeah, I did it. And you, all of us, and Lance are looking into that as well. That was part of the scope to understand what happens when a payment fails. What are we. What information are we getting back so that we can service it back to the user? Obviously, just generic, like something failed with the payment. 
Please try again. But. Yeah, but those are the two things I want to refine this afternoon as a larger group and then West. I will carve out time tomorrow with you early so that you have the finalized version going into architecture review. What time is architecture review tomorrow?

**Wesley Donaldson | 12:06**
It's normally got.

**Jennifer | 12:06**
That was actually just about to ask that it's normally today. I was going to see if you guys had time tomorrow at, 10:30. No, went the wrong way. 02:30 Eastern.

**Wesley Donaldson | 12:23**
Hold on. I can check for you right now.

**Stace | 12:27**
So we canceling today?

**Jennifer | 12:29**
I was gonna. Yeah, because it sounds like we want to wait until the product refinement today and then talk over everything after that.

**Speaker 6 | 12:37**
Okay. I do think it needs to happen tomorrow because I want to make sure we're going into the call with recurrly as prepared as possible on Thursday.

**Wesley Donaldson | 12:54**
I mean, Sam is clear in a clear part. Antonio, Sam and Tono are available at 02:00 pm on calendars tomorrow, so that would work perfectly.

**Stace | 13:04**
Well, the one thing I would say. Since we have the time blocked today. I think Sam briefed you yesterday on some stuff with the current connectors and event stream and BRNESS and changes there. So if there's anything that we need to go over with the team on that today. We can use the time for that.

**Wesley Donaldson | 13:32**
I think. Stacey, I think we're a little ahead of that. That what I was showing you the last screen that I shared and I can share my screen again really quickly. Window guy so Antonio finished the investigation. Sam and Antonio finished the investigation. Stam took a first pass. Antonio kind of it in the background as well. 
So coming out of that, we kind of created kind of action item like our plan of attack. Our plan of attack addresses kind of the items that Sam, I believe Sam discussed with you. So we already have those documented out. The conversation of how Emmett will make this will address this future going forward. 
Like that's kind of already built out. Antonio is kind of still reviewing these tickets to make sure we're fully aligned, but we expect to be able to pull these in this week into next week. Harry, the conversation that we spoke about in Status was specifically to determine if we want Mandor to take on some of these resolutions or if it makes more sense for someone in Endor just to kind of have that transparency or a combination of the two.

**Stace | 14:36**
Okay. Well, what I have and I'll look this up in Jira, I think. What we have to discuss though, is how much are we changing in results today versus making the process and code changes for everything we're doing with recuurly, right?

**Wesley Donaldson | 14:55**
So the direction Sam provided was this the M it is the future enablement for Rick Curly. This these two here are the short the three are the short term resolutions to kind of address the issue in the short term. 
But the long term plan is Emmett as our like our preferred framework or approach.

**Stace | 15:14**
Okay.

**Jennifer | 15:16**
Do we want to continue having the architecture meeting today? States and I'll just add thirty minutes in to talk about order submission tomorrow. Do you finalize on that before the were grilling meeting on Thursday?

**Wesley Donaldson | 15:32**
I guess I'd ask what are the topics we want to discuss in architecture? I have very. The things that I have for Mandor are pretty simple. It's an accessibility. A couple of one or twos until we have that conversation for recurr.

**Stace | 15:46**
Okay, yeah, I'm fine with just one meeting tomorrow.

**Jennifer | 15:51**
Okay, I'll move it to 02:30. Actually, Stace, you have something at 02:30, is that? Should I move it to 3 eastern?

**Speaker 6 | 16:08**
I moved the two PM.

**Stace | 16:10**
I can switch that around, I think. Okay.

**Jennifer | 16:16**
Perb.

**Wesley Donaldson | 16:19**
Sorry, Jennifer, were you saying 02:00 pm eastern E. St tomorrow? I have just looking at Sam's calendar and I haven't pinged him if he can move.

**Jennifer | 16:25**
I said 02:30 is that okay?

**Wesley Donaldson | 16:31**
What? He currently has. He has an opening at two to three. I can see if he can move his 30pm, but I have haven't asked him specifically for that yet.

**Jennifer | 16:41**
I'll do two to three and we just won't join office hours. I don't think I think that should be fine for the people that are joining this.

**Stace | 17:05**
If we're all set here and products want to talk attribution real quick. I had a meeting with Matt and Sale yesterday. That. That way. The good news is. I think you just have one super simple story that we have to do on our side.

**Speaker 6 | 17:22**
Awesome. Yeah, I've got a couple minutes if I'm going to dig into that. Okay?

**Stace | 17:38**
All right. So. Well, the long and short of it is they're largely starting with a different approach and kind of looking at a multichannel sales across DMA thing. They're most closely looking at a third party platform called House. Some of it depends. On. On pricing, whether we go forward or not, that would have a direct integration with our data link. 
So it's really not pulling anything from the website per SE at all. Which is interesting. So I think our approach on the website for now would be two prong. So what we should do probably the story that would require our development would be capture all the UTM parameters on the initial page load. Save it in local storage along with the appointment time. 
But we're selecting for the cart and Curly has an order tracking API and we'll just dump those values in there and they should get saved with the order.

**Speaker 6 | 18:50**
Awesome.

**Stace | 18:51**
Okay, that way it ends up right. It'll just be in our data attached to the order a lot. How shopf was supposed to work. The other thing I'd like to explore, but I think the setup of this would be more cloud ops. Deb ops is. Google now has a server side GA 4 Docker container implementation that we can either run in on GCP or throw it into Kubernetes on AWS that just gets configured with a same domain URL like analytics do lifeline screening dot com. 
And then the rest of the configuration is done in our Google GTM so there we can configure direct capture of all of that to the Google Tag Manager server. And they can use that set of tools too, without having to be bound by browser side cookie tracking or not. There's an option if we decide in the future you can stream the data from that server right to the data lake, so that might be something we explore too. 
But luckily in that case nothing we have to develop into our Thrive application, so I think we're good to start there and iterate as necessary.

**Speaker 6 | 20:13**
Okay, awesome. I'm interested about the order tracking endpoint. I didn't know that Rickly had that. Is that. Do you know if it's only for actual purchase orders or can we use it for creating draft orders and tracking? Basically the a pain in cart flow.

**Stace | 20:36**
You might be able to.

**Speaker 6 | 20:37**
Okay, that would be separate scope. Obviously, we would want to start with successful orders, but we definitely need insight into people who aren't purchasing.

**Speaker 7 | 20:48**
So. So in other words, bet that you're talking about specifically the people who like who've added stuff to their cart but then didn't complete the transaction. Yeah.

**Speaker 6 | 20:54**
Correct.

**Speaker 7 | 20:54**
Yeah, you would think so. I mean, you'd hope so.

**Stace | 20:57**
Do some reading on Iterable site. They kind of have some tags and products that look like it's aimed specifically at this.

**Speaker 5 | 21:10**
Is that the abandoned part?

**Speaker 6 | 21:12**
Yeah, sure, I know Ederb can support it. I'm just curious. How are we actually grabbing the data and storing it and putting it wherever it or needs it?

**Stace | 21:23**
We can the stuff got to do it for us. But let's say. Yeah.

**Speaker 6 | 21:29**
Okay, cool. Yeah, that's definitely not the tracking for successful orders we do need going into production, but I think the abandoned cart can be a fast follow. 
Do they have. And I don't know if this sits with the marketing team or something we need to decide. As product, I would really love to have more data around user behavior so that we can find in the design. Is that a tool that marketing is deciding on?

**Stace | 22:15**
No, I don't think we have anything other than general G got it. Okay, let's talk about it in products thing, if that's something we're interested in, we could look at some tools. We had to go through the home vendor management process, and there's nothing in the budget for one today. 
So we've got to figure out it.

**Speaker 6 | 22:38**
Okay, I didn't know if you already had one. I know we are using Microsoft Clarity somewhere, but it definitely is not comprehensive. Okay, cool. That was just a sad question. And I think we can get started on the session requirements probably later this week once we get through the happy path flow for getting an order into re curly.

**Stace | 23:08**
Okay. The other thing to think about in that product behavior. At least to start right? You can learn a lot if you set up a good comprehensive funnel in GTM not especially the React front end, right? You might have to call out the steps you want set up as the funnel events.

**Speaker 6 | 23:29**
Okay, I think Doug may be somewhat familiar with that, so he might be able to help out there for capturing the data.

**Speaker 5 | 23:42**
Let's. Yeah, let's do that. Doing the product. SN he used to run it from the marketing side, but what we need to do in here would be not only what he did, but little more text back driven based on what we know from Recurrly.

**Speaker 6 | 24:07**
Okay, cool. Thanks for the update. Jace. That's helpful. Yeah. Thank you.

