# Product X AppDev Office Hours - Mar, 24

# Transcript
**bethany.duffy@llsa.com | 00:31**
Hello, Wes. Do we have anything on the merchandise side that needs to be downloaded or talked about?

**Wesley Donaldson | 00:40**
Yes, we have two things. We have a concern or a proposal from you, Elvis, and then you, Elvis, we're going to walk you through.

**bethany.duffy@llsa.com | 00:47**
What's your mute? If you're talking?

**Wesley Donaldson | 00:50**
Yes, it was. We have two things. One, you almost took a good pass at just fixing some issues that we saw during the checkout flow minor styling issues.
So he'd like to walk us through that. Then two, he has one question on order flow that he wants to pose to you as well, Beth.

**bethany.duffy@llsa.com | 01:08**
Okay, let's start with the question first.

**Wesley Donaldson | 01:14**
Your officer here.

**bethany.duffy@llsa.com | 01:18**
Yes.

**Yoelvis | 01:19**
I what is the question is a question I have to ask or.

**Wesley Donaldson | 01:25**
I got you. We were talking about the membership discount as it pertains to membership discount versus the manually inputted discount. You mentioned that Rick Curly has a preferred mechanism in how it uses coupons as a tool to actually give discounts, including membership discounts. Does that sound familiar?

**Yoelvis | 01:45**
Right, give me one second.

**bethany.duffy@llsa.com | 01:47**
Yeah, I think I dropped the answer to that in the thread. I would like to move forward with just doing the order adjustment for the $30 credit at this point in time because we want to rework the way that membership is providing a discount anyway because when we create a coupon, it becomes available for anybody.
So it becomes very difficult for us to lock that down and make sure that people who shouldn't use it aren't using it. So I think that we need to just move forward with doing the adjustment for the membership credit.
Then that way if there are additional coupons, they can still be used as well.

**Yoelvis | 02:29**
Yes. The thing is. Like the $30 should be. Should apply for in every renewal. And that's my concern with the unit amount approach.

**bethany.duffy@llsa.com | 02:46**
I would say that's not an issue right now because these are all new memberships. We will just need to change the way that we're doing a membership discount from a flat fee to a percentage before they renew.
So that gives us twelve months to change our membership structure and I'm confident that we can do that.

**Yoelvis | 03:11**
Alright. So basically what we are doing is we are setting up a new price for the line items that are part of the membership. Instead of using the original price, we are using a discounted price.
So that's it and that's going to be the price for the renewal and everything else. Is that correct?

**bethany.duffy@llsa.com | 03:43**
Well, the renewal order won't go through recursively right now. The renewal orders are still being scheduled through CTAR so you will only be seeing new membership sales.

**Yoelvis | 04:01**
Yes, but we are adding the ramp pricing and everything else, right? Yeah. So we are expecting like renewals at some point. But I get what you say. It's like I mean, it's simpler just to use a custom pricing. I just was, taking a look at the documentation and they were suggesting like the coupon because is more like the native way that they handle promotions or discounts in the platform is easier to visualize.
But for now, I see we can go with the unit amount adjustment. And yeah, that's you were yeah.

**bethany.duffy@llsa.com | 04:50**
Yeah. We just need to make business decisions on our side before that first renewal hits for the first one that we sell on. How to change the discount structure for a membership and it's just because the configurations inside of Recurrly don't fit our use case for coupons.
Okay and then if we're good with that, we can move on to the demo.

**Yoelvis | 05:20**
Alright one time.
Okay, first thing, the ticket that Jeremy had assigned this one. It was a deployment issue, but the ticket was implemented. I noticed some mismatches, but we can take a look at that one as well. But it's pretty much like we want to display this section to be the design in bold.
It's bold here, as you can see.
We wanted this formatting for this error section to be the design. Now it's more like the design with the proper colors
and this number here.
Something I wanted to ask you is that I noticed here in this implementation they say when clicking the live line screen logo, it should take users back to the homepage.
I think Jeremy understood this incorrectly because when we click this button, it's taking the user back to the appointment. But the homepage is the live line screening homepage, I believe. No, not appointment.

**bethany.duffy@llsa.com | 07:40**
Out of it.

**Yoelvis | 07:41**
Yeah, I put that comment here, but I don't know why it's like POST but okay, it's post because...

**Speaker 4 | 07:53**
Can I ask a question? Just on that, if you're in the process of checking out, you're on the last checkout page, is that link still there? I guess I'm just wondering what the experience would be for somebody.
They're on the screen, they click that, no warning or anything. They're just on the homepage. If they press back, will it take them directly back to this checkout, or are they going to have to start over?

**Yoelvis | 08:19**
That's an excellent point.

**Stace | 08:23**
Yeah, I don't like exit links on the actual last page.

**Speaker 4 | 08:29**
Yeah, not without a warning. That's like, "Are you sure you want to leave?" or something.

**bethany.duffy@llsa.com | 08:34**
Okay, we can add that as an enhancement. "Are you sure you want to leave?"

**Stace | 08:39**
Yeah, because then there are questions of whether the session picks back up from local storage to test for. Did I lose my tracking parameters, all that fun stuff?

**Wesley Donaldson | 08:53**
Beth, do you want that enhancement for launch or is that something we want to put in post-launch?

**bethany.duffy@llsa.com | 08:58**
No, we can't do post-launch. I will add that to my post-launch list of things.

**Wesley Donaldson | 09:06**
Just to address the concern?

**bethany.duffy@llsa.com | 09:07**
But then...

**Wesley Donaldson | 09:08**
Is it worth just removing it? For launch. Like just removing the. You. Removing the click it was.

**bethany.duffy@llsa.com | 09:17**
I don't think we need to do that. I think it's a really fast follow, so I think we can prioritize this higher on the list and reduce those conversion issues.

**Yoelvis | 09:38**
Nothing I hate about this is when I type a date and I backspace. Space is removing now it's not doing that, it's removing everything. By now, I guess it's just when I have everything completed, I get hit backspace. It's getting rid of everything, but that's a small detail notice.
So here... Let me see the ticket. So this one. Errors warning are different from design please fix is different please fix. Okay, I think we are ready for review that one now it's more like the design. I don't know if 100% is color, but it's closer to the...
In the last confirmation page we have this number. It's confirmation way. Okay, that's phone sizing. Let me just complete the purchase and this element here. The font size is very pixel and it should be 11.
So I don't see this change. This is still 30 pixels.

**bethany.duffy@llsa.com | 11:20**
So yeah, I was going to ask if all the changes have been pushed into Sandbox because I'm not seeing some of the things that we talked about, like the yellow highlight and drop shadow arm persisting through Sandbox.
So I don't know if there's an outstanding pull request store. We just didn't get to that.

**Yoelvis | 11:40**
Yeah, we are... I already deployed the new environment. So all these changes should be in this sandbox in theory.
So this should be smaller. It's still big. It's a requirement that we didn't complete properly. Where else do we have the order summary? Okay, the order summary here is more compact. No product description or subtext should be like this and it's like this.
Okay, this one was implemented. The only thing that's missing is the phone size prorating. Yeah, I can't.

**Wesley Donaldson | 12:52**
Can you us can you check the size of that? Like, there's no way that's 1111 pixels for the height of that 1302.

**Yoelvis | 13:03**
Yeah, it's very pixelated.

**Wesley Donaldson | 13:04**
Yeah, but what is the design like? When I look at the design, that looks closer to maybe 20 or 25.

**Yoelvis | 13:11**
Got it. I missed seeing so this is the confirmation to be here design is 20. I can do that in the repository and so no problem for that one.

**Wesley Donaldson | 13:31**
Yeah. Eleven.
Yeah.

**Yoelvis | 13:48**
Something I don't like is this number. It's not what we want to hear, but that's a separate thing.

**Wesley Donaldson | 13:55**
Maybe just update your comments so you don't lose track of it.

**Yoelvis | 14:02**
With common.

**Wesley Donaldson | 14:03**
Yeah. You have a comment on the ticket that you were just looking at where you explicitly said, "Put it to 11 pixels, go back to 7608." That guy? Yeah.

**Yoelvis | 14:22**
What's the plan for the other number? Are we just hardcoding this LLS and the year?

**bethany.duffy@llsa.com | 14:30**
Yeah. So you guys can just pull the order number that you're getting today. The prefix for the order can be configured inside a recurring somewhere. It just... I don't think I have the right permissions to do it.
So that's on my list of things to track down.

**Yoelvis | 14:51**
So here we have this done and this is done and this button is misleading but we are already added the comment when clicking the call now on mobile. Okay, let me see if I can call now.
What is this calling? Okay, is this the right number? 455-809-7303.

**bethany.duffy@llsa.com | 15:41**
I can validate assurance. If you're...

**Speaker 6 | 15:49**
Calling to schedule.

**bethany.duffy@llsa.com | 15:49**
An appointment.

**Yoelvis | 15:50**
It looks... We will be okay.

**bethany.duffy@llsa.com | 15:54**
Let me just double-check. I don't know if we want to set up a new 09730. Yeah, so that's the one we have on Shopify today. I would say that's fine for now. I just want to double-check with Tom and make sure that they don't want to adjust that phone number.

**Yoelvis | 16:10**
Alright, so this is the email, this is the confirmation. So what's the way to handle this? Wesley, are we creating a new ticket for this detail? I can do that in my own refactoring staff.

**Wesley Donaldson | 16:30**
You have that one ticket that you...

**Yoelvis | 16:31**
Or are we moving this back to in progress?

**Wesley Donaldson | 16:34**
You have that one ticket you created from yesterday's review? I would just throw it in there. Just not to have a ticket for a CSS change.

**Yoelvis | 16:42**
Yeah, what can we do with this one? Just move it to complete.

**Wesley Donaldson | 16:46**
Moving to complete.
We have the comments on it.

**Yoelvis | 16:50**
Alright, okay, let me see if I don't forget them. Copy this to my note. Okay, regarding the changes, I've been working on a lot of changes. I thought it was going to be faster, but sometimes I go into the rally hole.
But this is the thing. We saw a lot of details in the different screens that we are fixing just to keep this as close to the design as possible and production-ready. One of the issues was that right now, this is working if we pass the SIP code.
Yeah, it's working. It's not failing anymore. For whatever reason, this was failing when we were opening the appointment directly. Other than that, there are a lot of adjustments here. The map size is smaller now, similar to the design. I am still trying to figure out how to fit all those elements within the map because I don't know why some of them are off the map, but that's something we can improve.
Here you can search by whatever. Now, if this thing is not valid, it's going to display this message instead of just what we were doing before. That was like closing this and just displaying the previous value here.
So if I put something like this, press this one, and it's invalid, it's going to just use it. Basically, here we are adding a lot of small tweaks when you select a car. We're adding this border that is in the design but was not implemented. We are adding this "show fewer times" button that is in the design but was not implemented either. We are doing a bunch of cosmetic changes. I am not done with the changes, but maybe for tomorrow I can show you all of them.

**Wesley Donaldson | 19:33**
Add two pigs two things you of us.

**Yoelvis | 19:33**
Actually, I am very close to everything, but I am just fighting with some details.

**Wesley Donaldson | 19:40**
Could you increase the responsive width of that screen? I think 3705 is what we're targeting to have the four across instead of the three across. You go. And the other item that we had was just a method towe this.

**Yoelvis | 19:55**
Let me do this. It's like we want... Let me put this in the notes, we want this to be four columns and what's the size?

**Wesley Donaldson | 20:06**
If it's 3705 or greater for mobile, it should be four columns. If it's less than 375, it should use the standard sizing to get it to fit.

**Yoelvis | 20:18**
Okay, I can do that as well. It's very simple.

**Wesley Donaldson | 20:22**
The other thing that we talked about yesterday was this... Remember when the zip code comes over and there is no zip code in the as part of the results that Google gives you in Los Angeles County, just a bet of...

**Yoelvis | 20:33**
I did. I did the... It's weird to get as here with no zip code, but in those cases I'm displaying this message. Let me know if you like... I can simplify the message. This was a... I suggested on it.

**Wesley Donaldson | 20:54**
Bet. Are you clear what the issue here is?

**Yoelvis | 20:58**
The issue is for what? What we use for searching, locations is not the actual location that we type here, but is the zip code associated with that location?
Because that's what the API is using. So we need this valid zip code. For whatever reason, in some I found this specific location when you selected Google Maps, Google APIs are not returning a zip code.
So...

**bethany.duffy@llsa.com | 21:32**
Yeah, let me do this one because... There would be a bundle of codes inside of that county, so this makes sense to me.

**Yoelvis | 21:40**
Okay, so I just put this message.

**bethany.duffy@llsa.com | 21:44**
Yep, that works.

**Yoelvis | 21:45**
Cloud. Cloud. Honestly, Cloud created this message for me. Yeah, okay.

**bethany.duffy@llsa.com | 21:52**
Perhaps the consul without a neighborhood for zip code and that message if we can edit verbiage.

**Yoelvis | 22:03**
County. So how's gonna be?

**bethany.duffy@llsa.com | 22:06**
E. GA city, zip code, or address instead of neighborhood?

**Yoelvis | 22:11**
I think... Perfect. So yeah, for tomorrow, maybe I can give you more details about the other changes in the different screens, but I am close to finishing this. I just was spending more time in those kind of details just to make sure those are the user will have a good experience.
Those are pretty simple tweaks that we can do, but are going to be good to have.

**bethany.duffy@llsa.com | 22:44**
Awesome, that's it, thank you. Anything else? I don't know if Nick, was there something you needed to go over?

**Speaker 6 | 23:02**
Yeah. I have changes for whenever the results aren't updated. In 24 to 48 hours. Let me find the...

**Yoelvis | 23:20**
Okay.

**Speaker 6 | 23:22**
Whenever they have completed the screening, but we don't have results yet. If it's more than 24 hours, we're hiding the tracker with an overlay like we do with canceled and this text.
That is it, very simple.

**bethany.duffy@llsa.com | 24:00**
Ray, is there any feedback for that one?

**Yoelvis | 24:05**
No, I think that's good. All right.

**bethany.duffy@llsa.com | 24:13**
Awesome, thank you.

**Speaker 6 | 24:18**
Thank you all. See you.

