declare @AvatarID bigint
declare @PackAmount int
declare @UserID int
declare @i int = 0
DECLARE @M_GUID VARCHAR(64)
DECLARE @Sex INT
DECLARE contact_cursor CURSOR FOR
SELECT [AvatarID]
      ,[PackAmount]
      ,UserID
      ,Sex
  FROM [DB_Src].[Temp].[dbo].[UserPack]

OPEN contact_cursor

-- Perform the first fetch.
FETCH NEXT FROM contact_cursor INTO @AvatarID,@PackAmount,@UserID,@Sex

-- Check @@FETCH_STATUS to see if there are any more rows to fetch.
WHILE @@FETCH_STATUS = 0
BEGIN
   -- This is executed as long as the previous fetch succeeds.
  --IF @UserID = 15674189 AND @AvatarID = 8605608781 
  BEGIN
   print @AvatarID
print @PackAmount
SET @M_GUID = NEWID();
EXEC CEQ_DynamicCouponDB.dbo.CEQ_AddToDynamicCouponQueue @PacketID = 13608, -- int
                    @AvatarID = @AvatarID, -- bigint
                    @Sex = @Sex, -- smallint
                    @Site = 0, -- int
                    @UserID = @UserID, -- bigint
                    @ItemCode = 34822, -- nvarchar(200)
                    @PacketItemTime = -1, -- int
                    @PacketItemCount = 3, -- int
                    @Source = 'Àë×ÓËþbug²¹³¥½ð±Ò', -- nvarchar(50)
                    @GUID =@M_GUID, -- uniqueidentifier
                    @Gold = 0, -- int
                    @BindCash = 0; -- int
                    
print '-----------------'
set @i = @i + 1;
END
 FETCH NEXT FROM contact_cursor INTO @AvatarID,@PackAmount,@UserID,@Sex
END
print @i
CLOSE contact_cursor
DEALLOCATE contact_cursor

