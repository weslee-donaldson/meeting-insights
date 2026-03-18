# Product X AppDev Office Hours - Mar, 17

# Transcript
**bethany.duffy@llsa.com | 01:36**
Alright, I think the Mandalor side will be longer, so Firman, if you want to start with yours, and then you can drop.

**Speaker 3 | 01:46**
Yeah, definitely. I'll share my screen. This guy. Okay, so, for now, I need to show you the facts that we have for correcting the glucose verbiage and drive. So right now, whenever you receive something with a less than symbol, like for this 1901, there was a header that went in, that's not performed.

**Wesley Donaldson | 02:16**
To...

**Speaker 3 | 02:18**
So it's basically just removing this part of the verbiage. So yeah, drive faster.
I crystals. So for the detailed... Here. So, yeah, for less than 40mg, the desk not performed header was removed, which is normally what the case should be. It was there. I think it was a typo or a copy-based error or something, but yeah.
But it's now removed when we're looking or when we're seeing a less than symbol and E5. So that's it.

**Speaker 4 | 03:32**
Thank you. Just to clarify, since you're showing on the admin portal, has this fix been implemented for the participant portal?

**Speaker 3 | 03:40**
Yes, yeah, I can show it.

**Yoelvis | 03:43**
To you too.

**Speaker 4 | 03:44**
Okay, so this is done ont yep.

**Speaker 3 | 03:48**
Okay.

**Speaker 4 | 03:48**
Thank you.

**Speaker 3 | 03:49**
Actually, just one place. Because the admin portal, when you generate the PDF here, it's the same.

**Speaker 4 | 03:57**
Gray answer.

**Yoelvis | 03:59**
Thank you. Yep, that's it. I'll share.

**bethany.duffy@llsa.com | 04:13**
Okay, awesome. You love it. It's your turn, sure.

**Yoelvis | 04:27**
One.

**bethany.duffy@llsa.com | 04:27**
Second.

**Yoelvis | 04:44**
Okay, we have a few tickets in ready for prod that are the ones I want to present. The first one is the iron in conflict with the membership are not removed. So the idea is that when we get to this step, if we add a few items here and we had and then we add the membership. Some of those individual tests are included in the membership, so it should be removed from the card and they were not removed previously.
So now when you add the... These are going to be removed from the card and that works here but if we add the membership, let's say in the packages, it's going to do the same logic. It's removing the other individual dynasty that are included in the membership.
So what's the idea? Should I move those to down if you are okay with the behavior?

**bethany.duffy@llsa.com | 06:07**
If it's merged in, yes.

**Yoelvis | 06:10**
Yes, everything I'm showing is in the what mercy I already... So about this one, I am not sure this is mostly like baton so I don't have anything to show.

**Wesley Donaldson | 06:29**
You can skip that one, the next two you can skip. You can skip the alert assessment. Maybe go on to... Yep, one right there, 6906.

**Yoelvis | 06:39**
Okay, regarding this one, it's like we are doing some cosmetic improvements. This one is the footer is like yellow. Okay? And yeah, now, as you can see here in Mobile View, it's like an iPhone 12 or 14 Pro Max.
Okay, the folder is a kind of amber is the color. I don't know if you can see it. Okay, I... Can you see it? In my screen, there is like a yellowish, okay, because I cannot see.

**Wesley Donaldson | 07:22**
This is like color you...

**Yoelvis | 07:27**
Yeah, it's a very subtle change. I don't know if it's exactly what we have in the Figma.

**bethany.duffy@llsa.com | 07:36**
I can check on my site too and see if it's just a screen share.

**Yoelvis | 07:45**
Let me just double-check here as well. The color, the exact color is this. Ummper 400. And here we have it in...

**bethany.duffy@llsa.com | 08:22**
Okay, yeah, when I do it on my phone, it's like a very light yellow gradient behind it. So for whatever reason, the screen chair just doesn't like to show it.

**Yoelvis | 08:32**
Yeah. Yeah. I was trying to find that here. I don't see it in the cold, but it's weird. But yeah, it's amber, so yeah, it's a yellow wish stuff. I think we could add the this, drop shadow that we have here.

**bethany.duffy@llsa.com | 08:54**
It's there, you just can't see it.

**Yoelvis | 08:58**
Is there?

**bethany.duffy@llsa.com | 08:59**
Yeah, I've got it open on my phone right now, and it's a very light yellow, and then there's a drop shadow behind the box.

**Yoelvis | 09:05**
All right, that's good. Okay, so this is the thing. Modify the time. Search and... Okay, the search and... Buttons. The first approach we had before was this one. But the designs are more like search buttons on a dry cancel at the bottom.
So here if I hit modify... Okay, this is the SBUDON, and the council is following the design. Let me just put this here like this.
So we are following the design for that one. But it's nice.
Council answers. So if you hit council, it's doing nothing. Even if I put here something... Okay, it's hard to hit... Cancel doing nothing. Okay. The search button is here at the right.

**bethany.duffy@llsa.com | 10:33**
The one thing I just noticed... Because you had the two open side by side... Do we have a defect for the padding on the buttons? Because if you look at the width of the button and the space around the time, like the appointment time button inside the card, there's a lot more white space on either side than in the Figma.

**Yoelvis | 11:00**
Okay, can you repeat? I don't...

**Wesley Donaldson | 11:02**
Yeah, it's liquid dessert.

**bethany.duffy@llsa.com | 11:03**
It looks... Yeah, after you just adjusted it, this looks closer. But in whatever view you just had, there was a lot more padding inside of the button itself. Wes, I don't know if we have a defect for that.

**Wesley Donaldson | 11:14**
We don't. I wonder... You want to adjust the size there we're to do a little bit of styling based on the available width of the viewport. That could be doing that.
Because when you only have three, then to make the whole space across and only have the left and right padding on the container, we need to make the buttons a little wider to make them...

**Yoelvis | 11:36**
Yeah, I am not following.

**Wesley Donaldson | 11:36**
Make a table smaller.

**bethany.duffy@llsa.com | 11:38**
So my concern is when I pull it up on my phone, I see two rows of times for four times instead of a single row, so I can send that screenshot.

**Yoelvis | 11:50**
Yeah, this row here is what you mean.

**bethany.duffy@llsa.com | 11:53**
Yeah, so before it wasn't staying in a single row, but I can just plug that as a separate defect, or else I can send it over to you and see if it fits somewhere.

**Wesley Donaldson | 12:06**
It's not already happened.

**Yoelvis | 12:07**
I think I...

**bethany.duffy@llsa.com | 12:11**
So the reason why I'm asking is because the vertical space that we have is very limited, and I don't want to be taking up an extra row for a single button. The buttons should always... The first four times should always be in a single row.

**Yoelvis | 12:29**
So what do you see on your phone? Do you see two times only?

**bethany.duffy@llsa.com | 12:35**
No, it's four times, but the fourth time is on the second row. Here I'll send in the chat, I'll click alright.

**Wesley Donaldson | 12:39**
Yeah, you Elvis, can you just... The width of the content of the viewport of your...

**Yoelvis | 12:41**
That's it.

**Wesley Donaldson | 12:44**
Yeah, you're seeing that.

**Yoelvis | 12:46**
Yeah, I think I implemented that one on purpose because when I am doing an algorithm here using grid because I don't want these items to be super compressed. If you allow for four items, in this view, for example, those are... If you allow for four items, in this view, for example, those are... The PN is going to be over the edge.
It's going to look very bad. So for that reason, we could change the phone's proly or... But I don't think it's a good idea to always make it for four columns because in some cases, it's going to look very bad.

**Wesley Donaldson | 13:29**
Hold on, this may be simpler than we're thinking. Is it 375 that you're showing right now, or is it 375 with when you're looking at the 4 across like... What's the width of the viewport you're using right now?

**Yoelvis | 13:41**
The people with EI don't know.

**Wesley Donaldson | 13:45**
You're using Chrome inspection tools.

**Yoelvis | 13:46**
Let me just open here.

**Wesley Donaldson | 13:47**
Can you just, like, use? Yup.
And then.

**Yoelvis | 13:49**
Yeah, let me just give you the...

**Wesley Donaldson | 13:51**
Here you go.

**Yoelvis | 13:52**
Okay, let me see, this is three.

**Wesley Donaldson | 13:58**
3705 is like the preferred size you should be using for mobile sizing, so at 375, we should try to get 4 rows across. That's the bug. Is that around?

**bethany.duffy@llsa.com | 14:08**
Okay, yeah, that works for me and my phone just... I and then that anything smaller would just not have... It would be another row, any smaller screen sizes like iPhone 4 or something.

**Wesley Donaldson | 14:08**
Right. Okay.

**bethany.duffy@llsa.com | 14:22**
Yeah, that works for me. I just have a very standard phone, and so the fact that it was the default experience was my concern.

**Yoelvis | 14:30**
Yeah, I would say we can try, but I can give you an idea of how it's going to look.

**Wesley Donaldson | 14:34**
Yeah.

**Yoelvis | 14:39**
Let me just put this. Let me just say
here for... Still feel... I'm going to say four. Here, one affair.

**bethany.duffy@llsa.com | 15:07**
I don't want to derail. We can just log that and then look into ITMMR.

**Yoelvis | 15:18**
Okay, I can, but, yeah, the only thing is I need to take care of this. Like I don't want the this to overflow the container. You know, those numbers, I can show you how it looks, but, yeah, I don't want something like this, you know?

**Wesley Donaldson | 15:34**
That is a low... Just for this... To focus on recovery.

**Yoelvis | 15:39**
That's what I mean, ladies. Okay, that's good feedback. Let me see what else we have in this ticket. Search and cancel buttons. That's okay. Right, and the calendar. Okay, for the calendar we are doing some changes. As you can see here, the calendar was not looking like the design. Now it should look more like the design, like with the arrows and those month and year separated and things like that.
So something I noticed about the calendars is huge. I don't know. How do you see it on your phone? But I think in general, we need to improve on the phone sizes. The phone sizes are a little bit larger here.
But other than that, the fix is about the arrow and the month and year. And that fix is working fine.
But you can see that this map here is okay. The design is huge. But I think we could do okay. This area here, for example, is smaller than this one and things like that. We could maybe revisit this at some point, in case you think it's not great for spacing.

**bethany.duffy@llsa.com | 17:40**
Yeah, I think it's okay for now. I'm leaning more towards figures. Probably better knowing our audience, so I wouldn't want to shrink it too much.

**Yoelvis | 17:51**
Yeah, so okay, yeah, that's completely fine. I just wanted to see if we could get something more like this, smaller because I opened this in some devices when it was looking huge.
If I opened it on an iPhone, for example, or probably the XS, I don't know if someone is using this iPhone, but in this case, it's going to look like something like this. Okay. In this case, you can select the date. I don't know why what's going on here.
Okay, but the ticket is about the arrows and not the styling. It was implemented properly. Calendar select one day, showing two days instead of one. Okay, now, when we select one single date, it's going to say "Show March 18th just that day."
Then if you select two dates, it's going to say the range.
The other thing was about the one-line membership, this separation was not in the... Okay, what's the thing here? Okay. It was like this before in the review page. And now the review page is looking better. It's
having the separation of the one-line membership and I'll see about this ticket. Any feedback or concerns? No good. Okay, let me move what down.

**Wesley Donaldson | 20:14**
Completed.

**Yoelvis | 20:20**
Confirmation order. Okay. This is when you complete the order. We should display the order number populated from recordly in voice ID.
So recorder is returning an invoice ID. We use that invoice ID to display the order number to the user. And we had some stuff before the actual ID but in general the ID there. So I can show you here if I place the order.
Mississippi, who works? Okay, I used the car that is not working. So yeah, let me try with the 411.
Okay, so the number. Okay. I was suspecting something different here but this core purchase is going to return from recordly the invoice number.
Okay, we just display here the invoice number. I was expecting something like ORD whatever and...

**Wesley Donaldson | 22:01**
Yeah, we did agree to that. So it should be some prefix and then the order number, and then the worry that we have here is that it shouldn't be sequential because someone can always guess what the next order number is. It should be some bit of uniqueness that's attached to it. Even if some portion is sequential.

**bethany.duffy@llsa.com | 22:24**
Yeah, I wonder if that's something we can configure within Recurly because yes, they are all sequential.

**Wesley Donaldson | 22:35**
We can maybe take the last four from the order or the last three from the charge invoice ID because that's alpha-numeric.

**bethany.duffy@llsa.com | 22:43**
Okay, yeah.

**Wesley Donaldson | 22:44**
But we can ask them that's a good question to pose.

**Yoelvis | 22:58**
So this one, is that a requirement here to display the prefix or not? No,

**Wesley Donaldson | 23:06**
No, it's. It's not explicitly stated on the ticket, but like, we should. We should have. We should have some kind of unique number. That's not clear to see the sequence.

**Yoelvis | 23:17**
Okay, so that's a follow-up task, right?

**Wesley Donaldson | 23:19**
Yeah, I'll create a ticket and reference 07:05.

**Yoelvis | 23:20**
This one is done. Why don't I see that down here? Sorry.

**Wesley Donaldson | 23:22**
That's not... Yeah, this is when it's done. Completed is the equivalent of done.

**Yoelvis | 23:39**
Ohr. Okay, so that one more UI stuff. Something I noticed here. This thing is still huge. We need to work on the phone size in general.

**Wesley Donaldson | 23:56**
We have a ticket to remove that section anyway. So maybe it solves itself. I think so. Right, chat here.

**Yoelvis | 24:05**
Alright, so let me get to this one. Car islands are very close in mobile view. Okay, now in mobile, just remove the... So in mobile view, the car islands here are now breathing.
You can see if there is more space. Let me see if it's like the design or not but what is the business one? This is quite... Let me see the flow. I don't see that line in the design, but we add that here. Hop... Can if I... The membership...
Okay, it's looking more like the design as you can see here with the spaces and everything. The only thing we added and I don't know if we needed is that line separate. What do you think? Do you like it?

**bethany.duffy@llsa.com | 25:55**
I don't know. If it's showing correctly on the screen share I see... Okay, yes, it's very late on my end. Yeah, that's fine.

**Yoelvis | 26:12**
All right. The other thing here we say first year free and the design is... It's very bad. I guess that we agree that this is the right call for now.

**bethany.duffy@llsa.com | 26:23**
Yeah. So that will be included in... Hopefully what we're going over today. I think for now, we do have to implement just membership using a permanent coupon. Then we'll just tap things differently on the business side.
So in this case, once we get that rolled out, then you would see the negative thirty but in the event that there is not an upsell, you would still see the first year free. Okay, so for now, yeah, that's fine. It'll be changing with the next epic that we pull in.

**Yoelvis | 27:00**
Alright, let me see where else. Okay, we have the select and upgrade. Miss in line. Select an... Grace. Do you have a line? Let me see... Sale... We have that line here. Maybe you don't see it, but it's there.

**bethany.duffy@llsa.com | 27:24**
But yeah, I can see it. I just went kind of hard, but I can see it.

**Yoelvis | 27:29**
Yeah, okay, most.

**Wesley Donaldson | 27:31**
Is that...? Sorry, hold on. I know that we pulled it from the Figma, the weight as well as the height and width of the line.

**bethany.duffy@llsa.com | 27:40**
He.

**Wesley Donaldson | 27:41**
But if you're having to squint, considering the demographic, do we...? Is that something we bring now?

**bethany.duffy@llsa.com | 27:45**
I think I want to say it's probably because of the screen share or it's not rendering what you would normally see on mobile. When I was on my phone... My phone died. So I had to go plug it in.
But it was much more visible. The things that I can't see here... I could see on my phone, so I'll just double-check once it's alive again.

**Wesley Donaldson | 28:06**
Sounds good.

**Yoelvis | 28:07**
Yeah, give me once.

**Wesley Donaldson | 28:07**
Sorry, I thought you were checking on your phone there for a second. Sorry.

**Yoelvis | 28:16**
Give me one second. I'll...
Hiling this is my phone, real phone, so it's probably easier to see.

**bethany.duffy@llsa.com | 29:03**
Yeah, there we go.

**Yoelvis | 29:06**
I see the yellow is more stronger now. Let me give you more. Can I...? No. Okay, so this is... Do you see the select and upgrade? Okay, we can select and review.

**bethany.duffy@llsa.com | 29:28**
So the only thing that I will is that yellow with the drop shadow was supposed to be persisted across the experience and it seems to have disappeared outside of the appointment change.

**Yoelvis | 29:39**
You are totally right. Yeah, I know. I said it was weird for me in the second step, it looked so different.

**bethany.duffy@llsa.com | 29:47**
It just looks like it disappears, which was why we wanted to make...

**Yoelvis | 29:51**
I can tell you this component we use in the first step is not the same component we are using in the other steps. So that's probably why and that's the fact we need to make it consistent. I would probably just use the same component and that's it, but yeah, that's a good point, Wesley.
Maybe we need to create another defect.

**Wesley Donaldson | 30:13**
Yeah, it's like... So that's after... So this packaging and app packaging review and checkout are missing the amber 400 color on the footer.

**Yoelvis | 30:29**
Yeah. The footer is looking different. Other thing. The other thing I wanted to say about this footer is that in the Designs, this date is shorter in the Designs and it's looking better in the Designs.
Basically sign for the step one.

**bethany.duffy@llsa.com | 30:55**
You just go over to... Yeah.

**Yoelvis | 30:59**
We don't say Pride or March. TW 2026.

**bethany.duffy@llsa.com | 31:03**
All that stuff.

**Yoelvis | 31:05**
Just Tuesday, February 10. It's shorter. In some cases, this time is going under the... It's not displayed because there is no space for all that very long date. So we need to improve the date to make it consistent here and here. Here is huge as well. For that reason, you see the new line for the time. There's no need to have the new line in the time. We don't need that much. I don't know, maybe the year makes sense in some cases because we could be...

**bethany.duffy@llsa.com | 31:39**
No, we don't let them schedule. We're really only showing... We personally only have things up to six months out, and then typically we are only showing three to four months.

**Yoelvis | 31:51**
All right, so yeah, it doesn't make sense. Probably spend the year. We can shorten the day of the week.

**Wesley Donaldson | 32:02**
One?

**bethany.duffy@llsa.com | 32:03**
I would just see what it's showing in the Figma. Whereas two for Tuesday and then Fab ten.

**Yoelvis | 32:10**
Yeah.

**bethany.duffy@llsa.com | 32:11**
I agree on the same thing. Like in your example, it would be Friday March twenty 7.

**Wesley Donaldson | 32:22**
Just to raise it as a concern. If today's current date was December 21st, then 2000 the year would be relevant.
I know it's three months, but if technically within that three-month window you'd still have December bookings, November bookings, that it might be relevant.

**bethany.duffy@llsa.com | 32:40**
But it would never be I it would never be for next year November.

**Wesley Donaldson | 32:42**
Exactly. You'd at least have in November.
Okay, ignore my devil's suggestion.

**Yoelvis | 32:56**
Yeah. Alright, so then what else do we have? Okay, but that's separate. Most popular. Okay, this thing here, most popular is it's like the design, but I don't see the star. That's another detail, but...

**bethany.duffy@llsa.com | 33:16**
Okay.

**Yoelvis | 33:18**
It was not part of the ticket probably, but maybe we can consider adding the star just to make it the design nicer.

**Wesley Donaldson | 33:27**
Can you just put that screen next to the designer for me, please? I'm going to grab a screenshot. Real quick, it's over a little.

**Yoelvis | 33:33**
One second e let me open here. You can s here's easier for us to see it.

**Wesley Donaldson | 33:45**
Thank you.

**Yoelvis | 34:07**
So where else? The thing was fixed now the does save whatever number we want the user to save is in one line by this perfect icon in the order summary is missing and it's different from design. Let me see. This is in the review, summary, your appointment order summary.
Okay, the icons are not the same as the ones that we have in the design, but they are having the background and everything else.

**bethany.duffy@llsa.com | 35:15**
Is that because we're pulling icons from a library or something?

**Yoelvis | 35:21**
Yeah, we could just copy the one from Figma, but in general, we try to use the ones that are in the library. It's Lucid icons. Yes, I can see.

**bethany.duffy@llsa.com | 35:40**
Can we check that those icons didn't come from... I don't know enough about all of it.

**Yoelvis | 35:48**
I don't think Chassian is providing icons. Okay.

**Wesley Donaldson | 35:53**
Can you just search inside of Lucid for a calendar? Probably the easiest thing to do.

**Yoelvis | 36:01**
No, yeah, that one is... I know it's coming from here, it's this one probably. Okay, I think I implemented that. I think we can get rid of this one person thing. It's not even consistent in all the pages.
But yeah.

**Wesley Donaldson | 36:22**
Sorry, let's close the loop on the icons. Beth, do you want us to match the Figma or can we continue with the Lucid icons?

**bethany.duffy@llsa.com | 36:30**
Can we just log it as a very low-level defect so that when I get the question of why is this different, I can say we de-prioritized it for other things.

**Yoelvis | 36:41**
Yeah, in general, I do. We see a few icons everywhere that are different, and it's because we are trying to follow Lucid's use of these ones. But I would say that we need to work with the designer to make sure they either follow the same use or the same icons that we use in this library, or we have a guideline to reuse whatever they put in the FMA and forget about the library.

**bethany.duffy@llsa.com | 37:10**
Okay, I'll bring that up to them in our sync this week. Make sure that they're using that library. Because I would rather you guys just be able to go there and search it and download it.

**Yoelvis | 37:19**
Yeah, we don't even need to download. It's just importing. Because the library is going to take care of everything else.

**bethany.duffy@llsa.com | 37:25**
Got it?

**Yoelvis | 37:26**
So it's easier we don't need to download and maintain the icons or anything else.

**bethany.duffy@llsa.com | 37:32**
Do you have to jump to another meeting? How much more do we have to go over? Do we need a part 2?

**Wesley Donaldson | 37:42**
The 50-minute.

**Yoelvis | 37:43**
Okay, and the thing is, those UX things that take time to see one by one, but, okay, we're going to have a part 2.

**Wesley Donaldson | 37:43**
The last one.

**bethany.duffy@llsa.com | 37:57**
This one, yeah, because I do need to run over to my other meeting, let me see how my afternoon looks. Oof, it doesn't look great. Let's do the second half tomorrow in the product off-hours.

**Yoelvis | 38:10**
Okay? Sounds good.

**bethany.duffy@llsa.com | 38:12**
Okay, thank you.

**Wesley Donaldson | 38:14**
Thanks. So, bye.

