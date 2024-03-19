app.post('/clickedusers', async (req, res) => {
    const newUserid = req.body;
    console.log(newUserid);
    const clickedUsers = await connectToMongoDB();
    // Find parent user by userId
    const query = { userId: newUserid.userId };
    const parentUser = await clickedUsers.findOne(query);
    console.log('Parent user:', parentUser);

    if (parentUser) {
        // Check if parent user already has 3 children
        if (parentUser.leftChild && parentUser.middleChild && parentUser.rightChild) {
            console.log('Parent user already has maximum children.');
            res.status(400).send({ error: 'Parent user already has maximum children.' });
            return;
        }
        // Add new user as left child if left child is empty
        if (!parentUser.leftChild) {
            const result = await clickedUsers.updateOne(query, { $set: { leftChild: newUserid } });
            console.log('User added as left child to existing parent:', newUserid);
            res.send(result);
            return;
        }
        // Add new user as middle child if middle child is empty
        if (!parentUser.middleChild) {
            const result = await clickedUsers.updateOne(query, { $set: { middleChild: newUserid } });
            console.log('User added as middle child to existing parent:', newUserid);
            res.send(result);
            return;
        }
        // Add new user as right child if right child is empty
        if (!parentUser.rightChild) {
            const result = await clickedUsers.updateOne(query, { $set: { rightChild: newUserid } });
            console.log('User added as right child to existing parent:', newUserid);
            res.send(result);
            return;
        }

    }

    // Insert new user if parent user not found
    const result = await clickedUsers.insertOne(newUserid);
    console.log('New user inserted:', newUserid);
    res.send(result);
});
