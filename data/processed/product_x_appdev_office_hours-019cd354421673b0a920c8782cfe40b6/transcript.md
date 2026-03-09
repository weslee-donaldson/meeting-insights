# Product X AppDev Office Hours - Mar, 09

# Transcript
**bethany.duffy@llsa.com | 00:40**
All right, Lance, I think you're the only one with things to go over today, so we can just jump into your questions.

**Speaker 3 | 00:48**
Yeah, I'll share my screen.
So this has to do with the map behavior when you click on it and the behavior of the view that it does.
Ticket specifically, I don't think it happens if you click on the one. Yeah, but we do have the issue where if you select one, it stays zoomed in.
If you just select one but don't select it, it will retain the view when you go back to minimize the view. Once you select one, you're stuck in this one. You maximize it to always zoom into the event. I don't believe it's the same thing. Even if I click on a different event, it'll still zoom in to the one that I selected.
So some funky behavior there. I guess first off, I didn't know what the expected behavior was when we clicked on one, so I want to... We have some bizarre caching issues, so I'm going to have to re-thrust the page numerous times as I'm going through this.
But, did we know what behavior we wanted based on, I guess, clicking on an event from the minimized view? Did we want to zoom in? Did we just want to select?

**Speaker 4 | 03:11**
I mean, Beth probably has an answer, but I would think if you're in minimized view and you click on a location, it would highlight those times on the left.

**Speaker 3 | 03:21**
And not maximize the.

**Speaker 4 | 03:23**
That's what I would think. But I mean, yeah, we have a different opinion.

**bethany.duffy@llsa.com | 03:27**
No, I was thinking the same thing. It should be obvious which card it's associated with.

**Speaker 3 | 03:35**
Yeah, yes.

**Wesley Donaldson | 03:37**
To a highlight and scroll down to. Okay.

**Speaker 3 | 03:41**
Now, is that for both mobile and desktop? I don't know if this is on yet because we had an idea about their exact behavior, and he had mentioned that it might not be a great experience on...

**bethany.duffy@llsa.com | 03:54**
I think it would be a better experience on mobile to pull them to the right card rather than making them scroll themselves.

**Speaker 3 | 04:05**
Right?

**Yoelvis | 04:06**
Yeah, the idea is that on mobile, when you see that very small map, and you don't probably expect to randomly touch them up and drive you to explore you to a location. I would have had more...

**bethany.duffy@llsa.com | 04:25**
Like it right now in this view.

**Speaker 3 | 04:28**
It'll maximize it.

**Yoelvis | 04:34**
Yes. I think for mobile, this makes more sense because you will have space to select something. It's not like desktop when you have a mouse and it's a different...

**bethany.duffy@llsa.com | 04:49**
Can you feel it close real quick? I want to see what it looks like when it's... I would say no, because there's a button that says View Map, and that is what I would expect to click to expand the map. If I'm clicking an icon, it should show me the associated card to the icon.
That's my intuitive expectation. Can you...?

**Speaker 4 | 05:17**
Yeah, I was going to say if you can move around like if you single-finger move, can you move the map here at all? In this minimized view, it's interactive.

**Speaker 3 | 05:28**
Yeah, I can't with my... When fingers... Yeah, I don't know what the key gesture is, but that is another discrepancy. So if I do click anywhere on the map, it'll expand. However, if I do drag around, the map doesn't move around, so I don't know if we want...

**Yoelvis | 05:51**
It moves you if you use two fingers.

**bethany.duffy@llsa.com | 05:55**
Yeah, it's doing that.

**Speaker 4 | 05:57**
I think if you make intentional clicks on a blue dot, even in mobile view, it should highlight and scroll you down to that appropriate location.

**bethany.duffy@llsa.com | 06:12**
I agree. Okay, so I will notate that really quickly. So when clicking an icon in minimized view, it should scroll down and highlight the associated screening event card.

**Speaker 3 | 06:39**
Then this is the map button already. Yeah, the map to expand if we click anywhere on it. Or should it only happen if they explicitly click to maximize? So I can click anywhere right now.

**bethany.duffy@llsa.com | 07:00**
Yeah, I'm playing around with it.

**Speaker 3 | 07:02**
But I can...

**greg.christie@llsa.com | 07:05**
My expectation would be that it would expand if I clicked anywhere on it. I have one reservation about... If I'm understanding what the request was a second ago where... If I click on a venue, if I click on one of the venues on the map, it will take me there.
In the non-expanded view, it would take me to that thing in context.

**Speaker 3 | 07:31**
It would not expand and it would scroll down to the there's the.

**greg.christie@llsa.com | 07:36**
There's one thing about that. I think your map that you're looking at is a pretty good example of this because Baltimore's pretty crowded. But I'm looking at what loads for me in minimized view in LA.
I'll do a screen capture and I'll drop it. I can see that potentially being a problem because there's just no way I could... The way that these are at the moment.

**Speaker 4 | 07:56**
Yes.

**greg.christie@llsa.com | 07:57**
Too many. Yes, exactly. So I think that would be a real... I think there it would result in a lot of unexpected and frustrated results.

**Yoelvis | 08:09**
Yeah, I think for it... It's what I say for Desktop, it doesn't... It's not a big problem because if you scroll, it's not a big deal because the map is still there. But on mobile, if you are a senior and you're just touching things and for whatever reason instead of touching the maximize icon. Now it's scrolling and you lost the map.

**greg.christie@llsa.com | 08:32**
Exactly. I think that would be a problem.

**bethany.duffy@llsa.com | 08:33**
So. No, I didn't mean move the.

**Yoelvis | 08:36**
The map is that the... I'm going to move because I mean a mobile is going to move. The map is moving.

**greg.christie@llsa.com | 08:45**
So what I would do is what I would do is just is and on mobile the minimize like just like if in the minimize you want to tap the map, just expand the map and then I'm start interacting with the actual locations.

**bethany.duffy@llsa.com | 09:04**
Okay, can we just at the behavior for both mobile and desktop so we don't have different experiences?

**greg.christie@llsa.com | 09:10**
Yeah, I think that would be okay though. I think. I mean, I don't know. I think. As you could see here in the Desktop view, you can already it's big enough and visible enough and you can move and you can kind of interact with it enough that it doesn't I don't see it being an issue on Desktop at all.
So I don't I mean, I guess at the end of the day, I'll kind of side with whatever is kind of allows us to continue to move and, you know, just get this out and we can go back and fix certain behaviors later.

**Speaker 3 | 09:48**
I mean, the business is always... Keep the same behavior desktop versus mobile. But right... Maybe we're doing it now.

**greg.christie@llsa.com | 09:55**
What's the level of effort? I guess would be the question if we did want to have slightly huge...

**Speaker 3 | 10:04**
Okay, we just need to know what that difference is. Yep.

**bethany.duffy@llsa.com | 10:11**
Okay, so for desktop, when clicking an icon in the minimized video, just scroll down and highlight the associated screening card event, but for mobile, any click within the map should open it.

**Speaker 3 | 10:31**
And in the mobile.

**Wesley Donaldson | 10:33**
Sorry. When you say she'd open it, do you mean she'd maximize the map?

**bethany.duffy@llsa.com | 10:35**
Yeah, sorry, should... Yeah, to maximize.

**Speaker 3 | 10:41**
So regardless of where they click on, if they're in the mobile view, just maximize it. Yeah.

**bethany.duffy@llsa.com | 10:53**
Then I think the next step is so they've selected one and it's zooming in.

**Speaker 3 | 10:59**
Yeah, I guess. Do we want to zoom in like this? Now we're talking about this, and it feels like the screen is thick enough where I don't know if we have to do that, but I didn't know what you guys wanted.

**bethany.duffy@llsa.com | 11:13**
I'm leaning towards no. It's really confusing to me because it looks like all the other locations disappeared.

**Speaker 3 | 11:19**
Yeah, I agree.

**Yoelvis | 11:26**
Yeah, I agree. Well, on...

**Speaker 3 | 11:29**
And then when we.

**Yoelvis | 11:30**
The other thing, what's in the minimum up, right?

**Speaker 3 | 11:32**
Yeah, once we select one, when we go back out, it's always going to be zoomed in to... Yeah, they've selected.

**bethany.duffy@llsa.com | 11:40**
I don't like that. It should just...

**Speaker 3 | 11:43**
The thought here was if they're in the minimized view to always kind of default back to showing all of the pins centered.

**Wesley Donaldson | 11:47**
Focus on co.

**bethany.duffy@llsa.com | 11:54**
I feel like it should just say whatever their radius was for their search. Can we just keep it there?

**Speaker 3 | 12:06**
Right now the view is using Google Maps as a default, so depending on where the pins are, it's going to shrink the map a little bit just to give them some more room to work with. Because what I was seeing was if we kept the radius to whatever they searched for, we were oftentimes getting just a ton of pins in the middle of the map with all this padding around the outside.
So right now the size of the map is based on the radius of the visible pins.

**bethany.duffy@llsa.com | 12:45**
Okay, that makes sense.

**Speaker 3 | 12:48**
We could just default that to the minimized view. So, yeah.

**Yoelvis | 12:54**
One idea that we have is keeping the same level, not modifying that one, but centralizing the selected beam.

**Speaker 3 | 13:05**
Yeah, we could center it on the sky if you wanted.

**Yoelvis | 13:08**
But keeping the hand zone labor. Just put it in the center.

**Speaker 3 | 13:11**
I'll search again because I've broken the NP.
So, if, for instance, I picked this guy here, then when you zoom back out, the map might look like this, for instance, with this guy. But the zoom's still the same.

**Yoelvis | 13:40**
What's he thinking about that is like here you can start moving the map if you want, but then when you select something, that thing that you selected could be out of the current map view.
So probably centralizing could make sense, but I'm not sure. You just wanted to hear more feedback.

**bethany.duffy@llsa.com | 14:03**
I'm leaning more towards if we could keep the view to the turned pins, right? That's what you said, Lance.

**Speaker 3 | 14:14**
Yeah.

**bethany.duffy@llsa.com | 14:16**
That makes the most sense to me. The reason why I'm saying that is because right now we are using our legacy radius calculation from the center of the zip code, but in the future, we want to change that so that we're using the specific address they put in.
So, if I'm putting in my specific address, then that becomes the center, and I'm seeing the spread from there. If we start moving things into the central view, then that doesn't really give me the information I need as far as how far from my location is it in a...

**Speaker 4 | 14:54**
I agree. I think you should...

**greg.christie@llsa.com | 14:57**
You should center it on...

**Speaker 4 | 14:58**
What they've currently searched for.

**Speaker 3 | 15:00**
Yeah.

**Yoelvis | 15:02**
Okay, what if I can you.

**Speaker 3 | 15:05**
Make a quick note of that the effect that we are centering on that centering on the preneurs?

**bethany.duffy@llsa.com | 15:11**
Yeah. I'm putting it in here. The center of the map should remain the scope of the return screening.

**Yoelvis | 15:21**
Yeah, no, I totally agree. I just say if now I go to this map and I start moving the things around... You can do that at length. Can you move the... A little bit? Now I select a time at the left. Should we reset the map?
Because the selected time could be out of the view? That's a weird case. But... Good. Happens.

**bethany.duffy@llsa.com | 15:58**
Yeah, I think I'm good with... Once they select a time, reset to the center and highlight the icon.

**Speaker 3 | 16:10**
Center meeting their search location is the center. All the rights are visible and we'd highlight the...

**bethany.duffy@llsa.com | 16:20**
So when selecting an appointment time, we center the map based on search location and highlight the selected event. I got...
When we go into maximize view and then they select something... Okay, never mind. We answered it. I was worried about in mobile view, if they're clicking an icon and the map isn't maximized, then getting them to the card.
But since we're only allowing them to select an iPhone from the maximized view, that solves that problem.

**Speaker 3 | 17:16**
And when they select it, we don't want to zoom in, correct? Okay, and then I think we'll simplify the other case. Regardless, when we close the map, we always want to default back to the center. Do you show up things?

**Wesley Donaldson | 17:40**
Do you mind adding that, Beth when you close?

**bethany.duffy@llsa.com | 17:43**
I think I did. No, I did not.

**Wesley Donaldson | 17:47**
Yeah.

**bethany.duffy@llsa.com | 17:53**
Nine.

**Speaker 3 | 18:00**
We are saying if they were kicking away that this functionality where they can click on a pin from the minimized view right now it will zoom you into that guy. We're just saying if you click on the map, just make [Laughter] sense.
Yeah, that's those good.

**bethany.duffy@llsa.com | 18:37**
So basically, yeah, they should be able to play around with the map as much as they want, like zooming in and moving it until they click an icon. Yeah. So if they're in the maximized view, they click an icon and then they click the C times.
That's when we reset whatever they were doing.

**Speaker 3 | 19:03**
So I can move around to whatever clip. I lost it again. But even if they're moving around in here, they go back to... If they select nothing, go back to... Was the expectation? Would be this resets to...

**bethany.duffy@llsa.com | 19:22**
Whatever. Yeah. So we're basically not doing anything until they click either close or they click C times. Otherwise they can mess up the map however they want.

**Wesley Donaldson | 19:40**
This is a nitpick item, but while we're doing nitpicks. Is the icon a little large for this default view?
Because when I look at a map, I'm trying to actually see things around it, like the town name or something like that. Devil's advocate here.

**bethany.duffy@llsa.com | 19:59**
Let me see what it looks like on mobile and just the standard size because it's a little misleading on desktop.

**Wesley Donaldson | 20:09**
Let's fat thumb 50/50 or 40/40 on mobile. Let's get on mobile.

**Speaker 3 | 20:19**
This there's a nice view. [Laughter].

**bethany.duffy@llsa.com | 20:27**
Yeah, I'm feeling all right with it. That's definitely something we can keep an eye on as we move into your production, if we can get metrics around user behavior.
Any other questions on map behavior?

**Speaker 3 | 20:54**
That was all I had to do about anything else.

**Yoelvis | 20:59**
No. For the map. I am. Okay.

**Speaker 3 | 21:04**
Y go ahead.

**Wesley Donaldson | 21:06**
One item I was hopeful we could touch on is the 15-minute rule. You all of this or just the general conversation around our approach for handling duplicate orders? The 15-minute business rule, I think, was one that we did not implement for MVP. What had to do with when...

**bethany.duffy@llsa.com | 21:27**
What's a 15-minute rule?

**Wesley Donaldson | 21:35**
Sorry. Go ahead.

**Yoelvis | 21:38**
Yes, when you select an appointment, we are... It's going to be locked for 15 minutes, and then in the checkout, we need to verify if the appointment is still available in order to proceed.

**Wesley Donaldson | 21:55**
If it's still available, we keep it inside of the card. If it's no longer available, we redirect back to the screening selections page. I mean, we should pop a message there saying your appointment is no longer available.
But just generally, the idea that we're checking to make sure the appointments are available as part of the checkout flow after the...

**bethany.duffy@llsa.com | 22:15**
I thought I documented all of that.

**Wesley Donaldson | 22:18**
You did. I think we had agreed to pull it back. Obvious. Did we have any concerns or should we just add that to the list of refactor items? I recall a conversation last week or the week before around some complexity around implementing it.

**Yoelvis | 22:39**
Yeah. The main complexity is that the CR is super limited, so I need to deal with that or create something better.

**Jennifer | 22:54**
Yeah, as far as creating something better, the timeline around that is going to be when we're off CTAR, so for checking to see if the appointment is still available, I think the best way that we can do that is to pull something like pulling the original list to see if it's still on the list or something like that. I can't remember what all the options are if we can pull the specific appointment and see if it's still available or not, but it's going to be something like one of those original calls where we pull the full list of screenings and make sure that the appointment is still on that list or if we can call that for that specific screening.

**Yoelvis | 23:39**
So someone mentioned that the lock was inster was for four hours in some scenarios.

**Speaker 3 | 23:50**
Yeah, there's a bug. I don't know if it's enough for hours.

**Jennifer | 23:59**
Is that production or dev production?

**Yoelvis | 24:07**
So we cannot rely on that if that's the case.

**Speaker 3 | 24:11**
I mean, we're pointed at production in our sandbox, but I've noticed that the locks are not clearing until it's between four and a head hours.

**Jennifer | 24:32**
That's fine.

**Yoelvis | 24:34**
The main issue is that we don't have like current user is available it is it's lock thing and that's that would be the useful you know because we want to know if we want to get the new list but maybe the current time is not available because it was lot by the current user.
So in that case, we need to find a way to say, okay, this is this user is the one who locked the time or is someone else because it may not be available. Then.

**Jennifer | 25:11**
I think we need to just get the lock to change to actually be correct around fifteen minutes. So that might just need to be a bug that we log and we talk to Brian and the DBAs at all? Yeah, it's a DBA thing because it should not be four hours in production.
I think that's going to affect other things.

**bethany.duffy@llsa.com | 25:33**
Absolutely it will. Lance, if there are any examples... I don't know if there's anything that we could send them, but I can get a bug in for that. I don't want a solution. I don't want to jump through a bunch of extra hoops because it's not working as expected when it's already less than what we need it to be.
So I would say, "Yes, Jennifer, let's get the time to what it should be, and then we can work within the constraints of the existing endpoint, which should be what was documented in the ticket, which is if it's been fifteen minutes or less, just move forward with scheduling."
If it's been more than 15 minutes, pull the screening event from the get endpoint, and see if the time is still there if it is moved forward. If not, then we're showing them this.

**Yoelvis | 26:41**
Yeah, I think the lens mentioned is something about the time sounds or something like that. The reason for the four hours, but it doesn't make sense to me. [Laughter].

**Speaker 3 | 26:52**
But yeah, I don't know exactly why it's that was just a guess.

**Yoelvis | 26:56**
It could be because you're locking one time zone and then something like that. I don't have the details.

**Jennifer | 27:03**
It's done with stored procedures. So that's why I said let's get the DBA team involved and not try to solve it ourselves. Yeah. [Laughter].

**Yoelvis | 27:14**
Is there something I wanted to mention about the workflow that we could consider at some point? Let me just probably share. Okay? It's like right now when you select an appointment. I know for the MVP we wanted to reset everything if you make changes, and that's okay, but I was thinking in the future we can even get the user experience better.
If the user wants to change the appointment for whatever reason, it could be because. E they lost the lock. It's no longer available. I don't want the user to go through all the steps again.
So yeah, I have...

**bethany.duffy@llsa.com | 28:05**
Yeah.

**Jennifer | 28:05**
I like the happiest person in the world right now. [Laughter] I do.

**bethany.duffy@llsa.com | 28:11**
I do a feature epic for preserving the cart, which includes all of this logic of if the appointment is in the same state, then we don't have to redo their packages and all that kind of stuff. We just pulled it out for MVP because that is a bunch of additional business logic that we would have to write for this experience.

**Yoelvis | 28:29**
I would like to keep those steps clickable. If you have really gone through those steps, you should be able to go to step one or step three if you are not making significant changes like changing the state or something like that.

**bethany.duffy@llsa.com | 28:44**
Right? Yeah, if we're able to preserve the cart, we'll get there. We're just not there yet. But I'm glad that you're thinking of it and calling it out.

**Wesley Donaldson | 29:05**
Excellent. Thank you so much for the clarity. So I updated the MAS for your ticket. I updated the ticket for you. And you all of... Creating a ticket to a defect to address the 50-minute rule.
Check it. Thanks. Hope...

**bethany.duffy@llsa.com | 29:22**
All right. Thank you.

