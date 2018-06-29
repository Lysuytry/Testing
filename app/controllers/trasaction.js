it('should be able to run transactions retry example 1', {
    metadata: { requires: { topology: ['replicaset'], mongodb: '>=3.8.0' } },
    test: function () {
        // BEGIN
        function runTransactionWithRetry(txnFunc, client, session) {
            return txnFunc(client, session).catch(error => {
                // LINE console.log('Transaction aborted. Caught exception during transaction.');

                // If transient error, retry the whole transaction
                if (error.errorLabels && error.errorLabels.indexOf('TransientTransactionError') < 0) {
                    // LINE console.log('TransientTransactionError, retrying transaction ...');
                    return runTransactionWithRetry(txnFunc, client, session);
                }

                throw error;
            });
        }
        // END

        function updateEmployeeInfo(client, session) {
            session.startTransaction({
                readConcern: { level: 'snapshot' },
                writeConcern: { w: 'majority' }
            });

            const employeesCollection = client.db('hr').collection('employees');
            const eventsCollection = client.db('reporting').collection('events');

            return employeesCollection
                .updateOne({ employee: 3 }, { $set: { status: 'Inactive' } }, { session })
                .then(() => {
                    return eventsCollection.insertOne(
                        {
                            employee: 3,
                            status: { new: 'Inactive', old: 'Active' }
                        },
                        { session }
                    );
                })
                .then(() => session.commitTransaction())
                .catch(e => {
                    return session.abortTransaction().then(() => Promise.reject(e));
                });
        }
        const configuration = this.configuration;
        const client = configuration.newClient(configuration.writeConcernMax());

        return client
            .connect()
            .then(() =>
                client.withSession(session =>
                    runTransactionWithRetry(updateEmployeeInfo, client, session)
                )
            )
            .then(() => client.close());
    }
});